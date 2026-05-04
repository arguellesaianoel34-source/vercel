import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetSiteContent, useUpdateSiteContent, getGetSiteContentQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ClientItem {
  name: string;
  domain?: string;
  link?: string;
  logoUrl?: string; // Custom uploaded logo URL
}

interface ClientsContent {
  headline: string;
  headlineAccent: string;
  description: string;
  clients: ClientItem[];
}

const DEFAULT: ClientsContent = {
  headline: "Trusted by",
  headlineAccent: "Global Clients",
  description: "From emerging startups to established enterprise companies across the US, Canada, and Australia — we provide the operational backbone that powers growth.",
  clients: [
    { name: "Gaywellness", domain: "gaywellness.com", link: "https://gaywellness.com" },
    { name: "ListGlobally", domain: "listglobally.com", link: "https://listglobally.com" },
    { name: "BC Media", domain: "bcmedia.tv", link: "https://bcmedia.tv" },
    { name: "Allstate Insurance", domain: "allstate.com", link: "https://allstate.com" },
    { name: "Velsoft - Canada", domain: "velsoft.com", link: "https://velsoft.com" },
    { name: "Brantley Solutions, LLC" },
    { name: "Family First Life Insurance", domain: "familyfirstlife.com", link: "https://familyfirstlife.com" },
    { name: "Spacer - Australia", domain: "spacer.com.au", link: "https://spacer.com.au" },
    { name: "Simply Wealth - Australia", domain: "simplywealthgroup.com.au", link: "https://simplywealthgroup.com.au" },
    { name: "IndoorMedia", domain: "indoormedia.com", link: "https://indoormedia.com" },
  ],
};

function normalizeClient(c: string | ClientItem): ClientItem {
  return typeof c === "string"
    ? { name: c }
    : { name: c.name ?? "", domain: c.domain, link: c.link };
}

function cleanDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

const LOCAL_LOGOS = import.meta.glob<{ default: string }>(
  "@/assets/images/clients/*.{png,svg,jpg,webp}",
  { eager: true },
);
const LOCAL_LOGO_BY_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(LOCAL_LOGOS).map(([path, mod]) => {
    const slug = path.split("/").pop()!.replace(/\.[^.]+$/, "");
    return [slug, mod.default];
  }),
);

function slugifyDomain(domain: string): string {
  return domain
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.(com|net|org|io|co|tv|au|us|biz)(\..+)?$/, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function logoPreview(client: ClientItem): string {
  // Priority: custom uploaded logo > local logo > clearbit API
  if (client.logoUrl) return client.logoUrl;
  if (client.domain) {
    return LOCAL_LOGO_BY_SLUG[slugifyDomain(client.domain)] ?? `https://logo.clearbit.com/${client.domain}`;
  }
  return "";
}

function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ClientsEditor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<ClientsContent>(DEFAULT);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const { data, isLoading } = useGetSiteContent("clients", {
    query: { queryKey: getGetSiteContentQueryKey("clients") },
  });

  const updateMutation = useUpdateSiteContent();

  useEffect(() => {
    if (data?.content) {
      const c = data.content as Partial<ClientsContent> & { clients?: (string | ClientItem)[] };
      setForm({
        ...DEFAULT,
        ...c,
        clients: (c.clients ?? DEFAULT.clients).map(normalizeClient),
      });
    }
  }, [data]);

  const handleSave = () => {
    updateMutation.mutate(
      { section: "clients", data: form as unknown as Record<string, unknown> },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSiteContentQueryKey("clients") });
          toast({ title: "Clients section saved successfully" });
        },
        onError: () => toast({ title: "Failed to save", variant: "destructive" }),
      }
    );
  };

  const updateClient = (index: number, field: keyof ClientItem, value: string) => {
    const updated = [...form.clients];
    updated[index] = {
      ...updated[index],
      [field]: field === "domain" ? cleanDomain(value) : value,
    };
    setForm({ ...form, clients: updated });
  };

  const addClient = () =>
    setForm({ ...form, clients: [...form.clients, { name: "", domain: "" }] });
  const removeClient = (index: number) =>
    setForm({ ...form, clients: form.clients.filter((_, i) => i !== index) });

  const handleLogoUpload = async (index: number, file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({ title: "Please upload an image file", variant: "destructive" });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Image size must be less than 2MB", variant: "destructive" });
        return;
      }

      // Convert to base64
      const base64 = await convertToBase64(file);
      
      // Update client with logo URL
      const updated = [...form.clients];
      updated[index] = { ...updated[index], logoUrl: base64 };
      setForm({ ...form, clients: updated });

      toast({ title: "Logo uploaded successfully" });
    } catch (error) {
      toast({ title: "Failed to upload logo", variant: "destructive" });
    }
  };

  const removeLogo = (index: number) => {
    const updated = [...form.clients];
    updated[index] = { ...updated[index], logoUrl: undefined };
    setForm({ ...form, clients: updated });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients Section</h1>
          <p className="text-muted-foreground mt-1">Edit the headline and the list of client logos shown on the landing page.</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Heading</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input className="bg-background" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Headline Accent (highlighted)</Label>
                <Input className="bg-background" value={form.headlineAccent} onChange={(e) => setForm({ ...form, headlineAccent: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea className="bg-background resize-none min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Client Names</CardTitle>
            <Button variant="outline" size="sm" onClick={addClient}>
              <Plus className="w-4 h-4 mr-1" /> Add Client
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Upload custom logos or use automatic logo fetching. Priority: <strong>Custom Upload</strong> → Local file (<code>src/assets/images/clients/&lt;slug&gt;.png</code>) → Clearbit API. Leave domain blank to show name as text. Link controls where clicking the card takes the visitor.
            </p>
            {form.clients.map((client, i) => (
              <div key={i} className="flex flex-col gap-3 p-4 rounded-md border border-border bg-background/40">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Logo Preview and Upload */}
                  <div className="flex flex-col items-center gap-2 sm:w-32 shrink-0">
                    <div className="h-24 w-24 rounded-full flex items-center justify-center overflow-hidden">
                      {logoPreview(client) ? (
                        <img
                          src={logoPreview(client)}
                          alt={client.name || client.domain || "Client logo"}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : null}
                      <div className={`text-[10px] text-muted-foreground text-center px-2 ${logoPreview(client) ? "hidden" : ""}`}>
                        No logo
                      </div>
                    </div>
                    <div className="flex gap-1 w-full">
                      <input
                        ref={(el) => { fileInputRefs.current[i] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLogoUpload(i, file);
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-7"
                        onClick={() => fileInputRefs.current[i]?.click()}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </Button>
                      {client.logoUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => removeLogo(i)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    {client.logoUrl && (
                      <span className="text-[10px] text-primary font-medium">Custom</span>
                    )}
                  </div>

                  {/* Client Details */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Display name</Label>
                      <Input
                        className="bg-background"
                        value={client.name}
                        onChange={(e) => updateClient(i, "name", e.target.value)}
                        placeholder="Allstate Insurance"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Domain (for auto logo)</Label>
                      <Input
                        className="bg-background font-mono text-sm"
                        value={client.domain ?? ""}
                        onChange={(e) => updateClient(i, "domain", e.target.value)}
                        placeholder="allstate.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Link (clickthrough)</Label>
                      <Input
                        className="bg-background font-mono text-sm"
                        value={client.link ?? ""}
                        onChange={(e) => updateClient(i, "link", e.target.value)}
                        placeholder={client.domain ? `https://${client.domain}` : "https://example.com"}
                      />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive shrink-0 self-start"
                    onClick={() => removeClient(i)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {form.clients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No clients. Click "Add Client" to add one.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </AdminLayout>
  );
}
