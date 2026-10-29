"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { finishWhatsAppEmbeddedSignup } from "@/app/actions/whatsapp-onboarding";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { messages } from "@/lib/i18n";
import type { WhatsAppSignupState } from "@/app/actions/whatsapp-onboarding";

export type EmbeddedSignupClientConfig = {
  appId: string;
  configId: string;
  graphVersion: string;
};

type SignupSession = { wabaId: string; phoneNumberId: string };
type SignupUiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "cancelled" }
  | { status: "failed" }
  | Exclude<WhatsAppSignupState, null>;
type FacebookLoginResponse = {
  status?: string;
  authResponse?: { code?: string | null } | null;
};

type FacebookSdk = {
  init: (options: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }) => void;
  login: (
    callback: (response: FacebookLoginResponse) => void,
    options: Record<string, unknown>,
  ) => void;
};

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

export function WhatsAppEmbeddedSignup({
  locale,
  config,
  connectedNumbers,
}: {
  locale: Locale;
  config: EmbeddedSignupClientConfig | null;
  connectedNumbers: {
    displayPhoneNumber: string | null;
    businessProfileName: string | null;
    needsReconnect: boolean;
  }[];
}) {
  const text = messages[locale];
  const router = useRouter();
  const [sdkReady, setSdkReady] = useState(false);
  const [registrationPin, setRegistrationPin] = useState("");
  const [authorizationCode, setAuthorizationCode] = useState<string | null>(
    null,
  );
  const [signupSession, setSignupSession] = useState<SignupSession | null>(null);
  const [state, setState] = useState<SignupUiState>({ status: "idle" });
  const processing = useRef(false);

  useEffect(() => {
    if (!config) return;

    const initialize = () => {
      if (!window.FB) return;
      window.FB.init({
        appId: config.appId,
        cookie: true,
        xfbml: false,
        version: config.graphVersion,
      });
      setSdkReady(true);
    };

    if (window.FB) {
      initialize();
      return;
    }

    const existingScript = document.getElementById("facebook-jssdk");
    window.fbAsyncInit = initialize;
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.onerror = () => setState({ status: "failed" });
    document.body.appendChild(script);
  }, [config]);

  useEffect(() => {
    if (!config) return;

    const onMessage = (event: MessageEvent) => {
      let hostname = "";
      try {
        hostname = new URL(event.origin).hostname;
      } catch {
        return;
      }
      if (hostname !== "facebook.com" && !hostname.endsWith(".facebook.com")) {
        return;
      }

      let payload: unknown = event.data;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload) as unknown;
        } catch {
          return;
        }
      }
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("type" in payload) ||
        payload.type !== "WA_EMBEDDED_SIGNUP"
      ) {
        return;
      }

      const message = payload as {
        event?: string;
        data?: Record<string, unknown>;
      };
      const data = message.data ?? {};
      const wabaId = data.waba_id;
      const phoneNumberId = data.phone_number_id;
      if (
        (message.event === "FINISH" ||
          message.event === "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING") &&
        typeof wabaId === "string" &&
        typeof phoneNumberId === "string"
      ) {
        setSignupSession({ wabaId, phoneNumberId });
        return;
      }
      if (message.event === "CANCEL" || message.event === "ERROR") {
        setState({ status: "cancelled" });
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [config]);

  useEffect(() => {
    if (!authorizationCode || !signupSession || processing.current) return;
    processing.current = true;
    setState({ status: "loading" });

    void finishWhatsAppEmbeddedSignup({
      locale,
      code: authorizationCode,
      wabaId: signupSession.wabaId,
      phoneNumberId: signupSession.phoneNumberId,
      registrationPin,
    }).then((result) => {
      setState(result);
      setAuthorizationCode(null);
      setSignupSession(null);
      setRegistrationPin("");
      if (result?.status === "success") router.refresh();
    }).catch(() => {
      setState({ status: "failed" });
      setAuthorizationCode(null);
      setSignupSession(null);
      setRegistrationPin("");
    });
  }, [authorizationCode, locale, registrationPin, router, signupSession]);

  function startSignup() {
    if (!config || !window.FB || !sdkReady || registrationPin.length !== 6) {
      return;
    }
    processing.current = false;
    setAuthorizationCode(null);
    setSignupSession(null);
    setState({ status: "loading" });

    window.FB.login(
      (response) => {
        const code = response.authResponse?.code;
        if (typeof code === "string" && code.length > 0) {
          setAuthorizationCode(code);
        } else if (response.status === "unknown") {
          setState({ status: "cancelled" });
        } else {
          setState({ status: "failed" });
        }
      },
      {
        config_id: config.configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {},
      },
    );
  }

  const statusMessage = getSignupMessage(state, text);

  return (
    <section className="mt-5 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
      <div className="max-w-3xl">
        <h2 className="text-sm font-semibold">{text.whatsappSignupTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {text.whatsappSignupDescription}
        </p>
        <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs leading-5 text-amber-900 dark:text-amber-100">
          {text.whatsappSignupSharedWorkspaceNote}
        </p>
      </div>

      {config ? (
        <div className="mt-5 max-w-xl">
          <label className="block text-sm font-medium" htmlFor="wa-registration-pin">
            {text.whatsappSignupPinLabel}
          </label>
          <input
            id="wa-registration-pin"
            autoComplete="off"
            className="mt-2 h-10 w-full max-w-xs rounded-lg border border-input bg-background px-3 text-sm tracking-[0.25em]"
            inputMode="numeric"
            maxLength={6}
            disabled={state.status === "loading"}
            onChange={(event) =>
              setRegistrationPin(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            pattern="[0-9]{6}"
            type="password"
            value={registrationPin}
          />
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {text.whatsappSignupPinHint}
          </p>
          <Button
            className="mt-4"
            disabled={!sdkReady || registrationPin.length !== 6 || state?.status === "loading"}
            onClick={startSignup}
            size="sm"
            type="button"
          >
            {state?.status === "loading"
              ? text.whatsappSignupLoading
              : sdkReady
                ? text.whatsappSignupButton
                : text.whatsappSignupSdkLoading}
          </Button>
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-muted/60 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
          {text.whatsappSignupNotConfigured}
        </p>
      )}

      {connectedNumbers.length > 0 && (
        <div className="mt-5 max-w-2xl rounded-xl bg-muted/50 p-3">
          <h3 className="text-xs font-semibold">{text.whatsappConnectedNumbers}</h3>
          <ul className="mt-2 space-y-1.5">
            {connectedNumbers.map((number) => (
              <li
                key={`${number.displayPhoneNumber ?? "connected"}-${number.businessProfileName ?? "business"}`}
                className="text-xs text-muted-foreground"
              >
                {number.businessProfileName
                  ? `${number.businessProfileName} · `
                  : ""}
                {number.displayPhoneNumber ?? text.whatsappConnectedNumber}
                {number.needsReconnect
                  ? ` · ${text.whatsappConnectionReconnectRequired}`
                  : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {statusMessage && (
        <p
          className={`mt-4 max-w-2xl text-sm leading-6 ${statusMessage.success ? "text-emerald-700 dark:text-emerald-300" : "text-destructive"}`}
          role={statusMessage.success ? "status" : "alert"}
        >
          {statusMessage.text}
        </p>
      )}
    </section>
  );
}

function getSignupMessage(
  state: SignupUiState,
  text: (typeof messages)[Locale],
): { text: string; success: boolean } | null {
  if (state.status === "idle" || state.status === "loading") {
    return null;
  }
  if (state.status === "cancelled") {
    return { text: text.whatsappSignupCancelled, success: false };
  }
  if (state.status === "failed") {
    return { text: text.whatsappSignupFailed, success: false };
  }
  if (state.status === "success") {
    return {
      text: state.displayPhoneNumber
        ? `${text.whatsappSignupSuccess} ${state.displayPhoneNumber}`
        : text.whatsappSignupSuccess,
      success: true,
    };
  }
  if (state.reason === "number-already-linked" || state.reason === "waba-already-linked") {
    return { text: text.whatsappSignupAlreadyLinked, success: false };
  }
  if (state.reason === "not-configured") {
    return { text: text.whatsappSignupNotConfigured, success: false };
  }
  return { text: text.whatsappSignupFailed, success: false };
}
