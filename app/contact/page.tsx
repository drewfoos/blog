"use client";

import { useState, useRef, useEffect } from "react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
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
import { AlertCircle, CheckCircle2, Loader2, Mail, User, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

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

      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    } catch (error) {
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
    <main className="relative min-h-[calc(100vh-4rem)] mb-3">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0" aria-hidden="true" />
      
      {/* Content */}
      <div className="relative w-full py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">
              Get in Touch
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground/80 max-w-md mx-auto">
              Have a question or just want to say hello? I&apos;d love to hear from you.
            </p>
          </motion.header>

          {/* Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardHeader className="space-y-3">
                <CardTitle className="text-xl sm:text-2xl font-medium tracking-tight">
                  Contact Form
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground/80">
                  Fill out the form below and I&apos;ll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Honeypot */}
                  <div className="hidden">
                    <Input
                      {...register("website")}
                      type="text"
                      autoComplete="off"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Name Input */}
                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        {...register("name", { required: "Name is required" })}
                        placeholder="Your name"
                        className="pl-9 h-11 bg-transparent"
                        aria-label="Your name"
                      />
                    </div>
                    {errors.name && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm font-medium text-destructive"
                      >
                        {errors.name.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
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
                        className="pl-9 h-11 bg-transparent"
                        aria-label="Your email address"
                      />
                    </div>
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm font-medium text-destructive"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="space-y-2">
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                      <Textarea
                        {...register("message", { required: "Message is required" })}
                        placeholder="Your message"
                        className="pl-9 min-h-[150px] bg-transparent resize-y"
                        aria-label="Your message"
                      />
                    </div>
                    {errors.message && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm font-medium text-destructive"
                      >
                        {errors.message.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Status Alerts */}
                  <AnimatePresence mode="wait">
                    {submitStatus === "success" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert variant="default" className="border-green-500/30 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertTitle className="font-medium">Success!</AlertTitle>
                          <AlertDescription>
                            Your message has been sent successfully. I&apos;ll get back to you soon.
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    {submitStatus === "error" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle className="font-medium">Error</AlertTitle>
                          <AlertDescription>
                            {errorMessage || "Failed to send message. Please try again later."}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Turnstile */}
                  <div aria-label="Security verification">
                    {isClient && window.location.hostname !== "localhost" && (
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
                          execution: "render",
                        }}
                      />
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium"
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
          </motion.div>
        </div>
      </div>
    </main>
);

}