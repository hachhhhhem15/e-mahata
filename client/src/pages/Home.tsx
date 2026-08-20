import { useEffect } from "react";

export default function Home() {
  /** Official Service Gateway: the deployable portal remains a single standalone RTL HTML file. */
  useEffect(() => {
    window.location.replace("/e-mahata.html");
  }, []);

  return <main className="min-h-screen bg-[#f8f9fa]" aria-busy="true" />;
}
