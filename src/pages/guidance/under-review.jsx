import { URLS } from "@/constants";
import { useUpdateDocumentTitle } from "@/hooks";
import React from "react";

const UnderReview = () => {
  useUpdateDocumentTitle({
    title: `Under Review - ${URLS.LOGO_TEXT}`,
  });

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">🎉 Under Review!</h1>
      <p className="text-base mb-6 max-w-md">
        Your account is under review. Our admin team will verify your details
        shortly. Once approved, you'll receive an email with a verification
        link.
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        Please check your inbox (and spam folder) for updates.
      </p>
    </div>
  );
};

export default UnderReview;
