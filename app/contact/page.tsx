"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

// Dynamically import Turnstile with no SSR
const Turnstile = dynamic(
  () => import("@marsidev/react-turnstile").then(mod => mod.Turnstile),
  { 
    ssr: false,
    loading: () => <div className="min-h-[65px]" /> 
  }
);

type FormData = {
  name: string;
  email: string;
  message: string;
  website: string;
};

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load Turnstile when user starts interacting with form
  const handleFormFocus = () => {
    setShowTurnstile(true);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  // Reset Turnstile on error or after timeout
  useEffect(() => {
    if (submitStatus === "error" && turnstileRef.current) {
      turnstileRef.current.reset();
    }

    if (submitStatus === "success") {
      const timer = setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const onSubmit = async (data: FormData) => {
    if (data.website) return;

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    try {
      const token = isClient && window.location.hostname === "localhost"
        ? "development"
        : turnstileRef.current?.getResponse();

      if (!token && window.location.hostname !== "localhost") {
        throw new Error("Please complete the captcha verification");
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          message: data.message,
          token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      setSubmitStatus("success");
      reset();
      setShowTurnstile(false); // Reset visibility

      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    } catch (error) {
      console.error("Error sending form:", error);
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to send message");

      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTurnstileError = () => {
    setSubmitStatus("error");
    setErrorMessage("Captcha verification failed. Please try again.");
    if (turnstileRef.current) {
      turnstileRef.current.reset();
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-serif">Get in Touch</h1>
          <p className="text-muted-foreground">
            Have a question or just want to say hello? I&apos;d love to hear from you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Form</CardTitle>
            <CardDescription>
              Fill out the form below and I&apos;ll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" onFocus={handleFormFocus}>
              {/* Rest of your form fields stay the same */}
              <div className="hidden">
                <Input {...register("website")} type="text" autoComplete="off" tabIndex={-1} aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <Input
                  {...register("name", { required: "Name is required" })}
                  placeholder="Your name"
                  className={errors.name ? "border-red-500" : ""}
                  aria-label="Your name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500" role="alert">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  placeholder="Your email"
                  className={errors.email ? "border-red-500" : ""}
                  aria-label="Your email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-500" role="alert">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  {...register("message", { required: "Message is required" })}
                  placeholder="Your message"
                  className={errors.message ? "border-red-500" : ""}
                  rows={6}
                  aria-label="Your message"
                />
                {errors.message && (
                  <p className="text-sm text-red-500" role="alert">{errors.message.message}</p>
                )}
              </div>

              {submitStatus === "success" && (
                <Alert
                  variant="default"
                  className="bg-green-500/15 text-green-500 border-green-500/50"
                  role="alert"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    Your message has been sent successfully. I&apos;ll get back to you soon.
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === "error" && (
                <Alert variant="destructive" role="alert">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {errorMessage || "Failed to send message. Please try again later."}
                  </AlertDescription>
                </Alert>
              )}

              <div className="min-h-[65px] px-4 py-2 sm:p-0" aria-label="Security verification">
                {isClient && showTurnstile && window.location.hostname !== "localhost" && (
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
                    onError={handleTurnstileError}
                    options={{
                      theme: "auto",
                      retry: "auto",
                      appearance: "always",
                      refreshExpired: "auto",
                      language: "auto",
                      size: "normal",
                      execution: "render"
                    }}
                    onSuccess={(token) => {
                      console.log("Turnstile token generated:", token?.slice(0, 10) + "...");
                    }}
                    onExpire={() => {
                      console.log("Turnstile token expired");
                      if (turnstileRef.current) {
                        turnstileRef.current.reset();
                      }
                    }}
                  />
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                aria-label={isSubmitting ? "Sending message..." : "Send message"}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}