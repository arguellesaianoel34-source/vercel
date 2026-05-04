import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Server, 
  Mail, 
  Lock, 
  Send, 
  ShieldCheck, 
  RefreshCcw,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  Info
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGetSiteContent, useUpdateSiteContent, getGetSiteContentQueryKey, customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const smtpSchema = z.object({
  smtpHost: z.string().min(1, "SMTP Host is required"),
  smtpPort: z.string().min(1, "SMTP Port is required"),
  smtpUser: z.string().min(1, "SMTP Username is required"),
  smtpPassword: z.string().min(1, "SMTP Password / API Key is required"),
  fromEmail: z.string().email("Invalid sender email address"),
  fromName: z.string().min(1, "Sender Name is required"),
});

type SMTPFormValues = z.infer<typeof smtpSchema>;

const testEmailSchema = z.object({
  testEmail: z.string().email("Invalid recipient email address"),
  testSubject: z.string().min(1, "Subject is required"),
  testMessage: z.string().min(1, "Message is required"),
});

type TestEmailValues = z.infer<typeof testEmailSchema>;

export default function SMTPSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [showTestEmail, setShowTestEmail] = useState(false);

  const { data: smtpContent, isLoading } = useGetSiteContent("smtp");
  const updateContent = useUpdateSiteContent();

  const form = useForm<SMTPFormValues>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      smtpHost: "smtp-relay.brevo.com",
      smtpPort: "587",
      smtpUser: "",
      smtpPassword: "",
      fromEmail: "",
      fromName: "VibeAlong",
    },
  });

  const testEmailForm = useForm<TestEmailValues>({
    resolver: zodResolver(testEmailSchema),
    defaultValues: {
      testEmail: "",
      testSubject: "Test Email from VibeAlong",
      testMessage: "This is a test email to verify your SMTP configuration. If you receive this, your email setup is working correctly!",
    },
  });

  useEffect(() => {
    if (smtpContent?.content) {
      form.reset(smtpContent.content as SMTPFormValues);
    }
  }, [smtpContent, form]);

  async function onSubmit(values: SMTPFormValues) {
    try {
      await updateContent.mutateAsync({
        section: "smtp",
        data: values,
      });
      
      queryClient.invalidateQueries({ queryKey: getGetSiteContentQueryKey("smtp") });
      
      toast({
        title: "Settings Saved",
        description: "Your SMTP configuration has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "An error occurred while saving settings.",
        variant: "destructive",
      });
    }
  }

  async function onTestConnection() {
    setIsTesting(true);
    try {
      const config = form.getValues();
      
      const result = await customFetch<any>('/api/email/test-connection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      toast({
        title: "Connection Successful",
        description: result.message || "SMTP connection test passed!",
      });
    } catch (error: any) {
      console.error('Test connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to SMTP server. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  }

  async function onSendTestEmail(values: TestEmailValues) {
    setIsSendingTest(true);
    try {
      const config = form.getValues();
      
      const result = await customFetch<any>('/api/email/send-test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          to: values.testEmail,
          subject: values.testSubject,
          text: values.testMessage,
        }),
      });

      toast({
        title: "Test Email Sent",
        description: result.message || `Test email sent successfully to ${values.testEmail}. Check your inbox!`,
      });
      setShowTestEmail(false);
    } catch (error: any) {
      console.error('Send test email error:', error);
      toast({
        title: "Failed to Send",
        description: error.message || "Could not send test email. Please check your SMTP settings and ensure your sender email is verified in Brevo.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">SMTP Settings</h2>
        <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5 text-primary border-primary/20">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
          Brevo Integration
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-primary/10 shadow-lg">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email Configuration
                </CardTitle>
                <CardDescription>
                  Configure your Brevo SMTP settings to send emails from contact forms and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="smtpHost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp-relay.brevo.com" {...field} />
                        </FormControl>
                        <FormDescription>Brevo SMTP server address</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smtpPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input placeholder="587" {...field} />
                        </FormControl>
                        <FormDescription>Usually 587 for TLS or 465 for SSL</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="smtpUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Username</FormLabel>
                      <FormControl>
                        <Input placeholder="your-brevo-email@example.com" {...field} />
                      </FormControl>
                      <FormDescription>Your Brevo account email address</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtpPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Password / API Key</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Your SMTP Key" 
                            {...field} 
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Get this from Brevo &rarr; Settings &rarr; SMTP & API
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t border-primary/10">
                  <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    Sender Information
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email</FormLabel>
                          <FormControl>
                            <Input placeholder="info@vibeglobally.ph" {...field} />
                          </FormControl>
                          <FormDescription>Email address that appears as sender</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Name</FormLabel>
                          <FormControl>
                            <Input placeholder="VibeAlong" {...field} />
                          </FormControl>
                          <FormDescription>Name that appears as sender</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3 bg-primary/5 border-t border-primary/10 py-4">
                <Button 
                  type="submit" 
                  disabled={updateContent.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {updateContent.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Server className="w-4 h-4 mr-2" />
                  )}
                  Save Settings
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onTestConnection}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </Button>

                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowTestEmail(!showTestEmail)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {showTestEmail ? "Hide Test Email" : "Send Test Email"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>

        {showTestEmail && (
          <Card className="border-accent/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
            <CardHeader className="bg-accent/5 border-b border-accent/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-accent" />
                Send Test Email
              </CardTitle>
              <CardDescription>
                Send a real test email to verify your configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...testEmailForm}>
                <form onSubmit={testEmailForm.handleSubmit(onSendTestEmail)} className="space-y-4">
                  <FormField
                    control={testEmailForm.control}
                    name="testEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your-email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end pt-2">
                    <Button 
                      type="submit" 
                      variant="default" 
                      disabled={isSendingTest}
                      className="bg-accent hover:bg-accent/90"
                    >
                      {isSendingTest ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Now
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>Quick Setup Guide</AlertTitle>
          <AlertDescription className="text-sm">
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Login to your <a href="https://app.brevo.com/" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline inline-flex items-center">Brevo Dashboard <ExternalLink className="w-3 h-3 ml-0.5" /></a></li>
              <li>Navigate to <strong>Settings &rarr; SMTP & API</strong></li>
              <li>Copy your <strong>SMTP Key</strong> and paste it into the password field above</li>
              <li>Ensure your <strong>From Email</strong> is a verified sender in Brevo</li>
              <li>Save and use <strong>Test Connection</strong> to verify</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
