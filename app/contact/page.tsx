import { useState, useRef, useEffect } from "react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormData = {
  name: string;
  email: string;
  message: string;
  website: string;
};

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [isClient, setIsClient] = useState(false);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (data.website) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const token = isClient && window.location.hostname === 'localhost'
        ? 'development'
        : turnstileRef.current?.getResponse();

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
          token,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      setSubmitStatus('success');
      reset();
    } catch (error) {
      console.error('Error sending form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-serif">Get in Touch</h1>
          <p className="text-muted-foreground">
            Have a question or just want to say hello? I'd love to hear from you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Form</CardTitle>
            <CardDescription>
              Fill out the form below and I'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="hidden">
                <Input
                  {...register('website')}
                  type="text"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Your name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  placeholder="Your email"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  {...register('message', { required: 'Message is required' })}
                  placeholder="Your message"
                  className={errors.message ? 'border-red-500' : ''}
                  rows={6}
                />
                {errors.message && (
                  <p className="text-sm text-red-500">{errors.message.message}</p>
                )}
              </div>

              {submitStatus === 'success' && (
                <Alert variant="default" className="bg-green-500/15 text-green-500 border-green-500/50">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    Your message has been sent successfully. I'll get back to you soon.
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to send message. Please try again later.
                  </AlertDescription>
                </Alert>
              )}

              {/* Pre-allocated space for Turnstile */}
              <div className="min-h-[65px] px-4 py-2 sm:p-0">
                {isClient && window.location.hostname !== 'localhost' && (
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
                    options={{
                      theme: 'auto',
                    }}
                  />
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}