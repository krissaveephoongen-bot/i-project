"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function ProjectsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the complete projects page
    router.replace("/projects-complete");
  }, [router]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      backgroundColor: "#f5f5f5"
    }}>
      <Spin size="large" tip="Redirecting to Projects Complete..." />
    </div>
  );
}
