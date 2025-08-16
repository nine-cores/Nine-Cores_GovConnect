"use client"

import { Button } from "./ui/button"
import { useLanguage } from "../contexts/LanguageContext"
import { Globe } from "lucide-react"

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center space-x-1">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="h-8 px-2 text-xs hover:bg-primary"
      >
        EN
      </Button>
      <Button
        variant={language === "si" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("si")}
        className="h-8 px-2 text-xs hover:bg-primary"
      >
        සිං
      </Button>
    </div>
  )
}
