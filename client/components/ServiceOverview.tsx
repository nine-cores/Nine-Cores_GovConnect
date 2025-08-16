"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import {
  User,
  LogIn,
  LogOut,
  Calendar,
  FileText,
  CreditCard,
  Car,
  Home,
  Users,
  Shield,
  Building,
  Phone,
  Mail,
  MapPin,
  Search,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { isUserLoggedIn, getUserData, clearUserData } from "../lib/utils";
import { clearAuthToken } from "../lib/api";

const services = [
  {
    id: 1,
    name: "gramaniladhari",
    description: "gramaniladhari.desc",
    icon: FileText,
    enabled: true,
    href: "/services/gramaniladhari",
  },
  {
    id: 2,
    name: "nic",
    description: "nic.desc",
    icon: CreditCard,
    enabled: true,
    href: "/services/gramaniladhari",
  },
  {
    id: 3,
    name: "motor",
    description: "motor.desc",
    icon: Car,
    enabled: true,
    href: "/services/motor-traffic",
  },
  {
    id: 4,
    name: "land",
    description: "land.desc",
    icon: Home,
    enabled: false,
    href: "#",
  },
  {
    id: 5,
    name: "civil",
    description: "civil.desc",
    icon: Users,
    enabled: false,
    href: "#",
  },
  {
    id: 6,
    name: "police",
    description: "police.desc",
    icon: Shield,
    enabled: false,
    href: "#",
  },
  {
    id: 7,
    name: "municipal",
    description: "municipal.desc",
    icon: Building,
    enabled: false,
    href: "#",
  },
  {
    id: 8,
    name: "tax",
    description: "tax.desc",
    icon: FileText,
    enabled: false,
    href: "#",
  },
  {
    id: 9,
    name: "education",
    description: "education.desc",
    icon: FileText,
    enabled: false,
    href: "#",
  },
  {
    id: 10,
    name: "health",
    description: "health.desc",
    icon: FileText,
    enabled: false,
    href: "#",
  },
];

export default function ServiceOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on component mount
    const loggedIn = isUserLoggedIn();
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      const user = getUserData();
      setUserData(user);
    }
  }, []);

  const handleProfile = () => {
    router.push("/citizen/profile");
  };

  const handleLogout = () => {
    // Clear authentication data
    clearAuthToken();
    clearUserData();
    setIsLoggedIn(false);
    setUserData(null);

    // Redirect to home page
    router.push("/");
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">
                {t("nav.title")}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />

              {isLoggedIn ? (
                // Show user info and logout when logged in
                <>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <span className="hidden sm:inline">
                      {t("nav.welcome")},{" "}
                      {userData?.displayName || userData?.name || t("nav.user")}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleProfile}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("nav.profile")}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t("nav.calendar")}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("nav.logout")}</span>
                  </Button>
                </>
              ) : (
                // Show login button when not logged in
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-primary"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t("nav.calendar")}
                    </span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <a href="/login" className="hidden sm:inline">
                      {t("nav.login")}
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t("home.welcome")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.description")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("home.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredServices.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={service.id}
                className={`flex h-full flex-col transition-all duration-200 ${
                  service.enabled
                    ? "hover:shadow-lg cursor-pointer border-primary/20 hover:border-primary/40"
                    : "opacity-60 cursor-not-allowed bg-muted/50"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        service.enabled
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-semibold leading-tight">
                        {t(`service.${service.name}`)}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col flex-1">
                  <CardDescription className="text-xs leading-relaxed">
                    {t(`service.${service.name}.desc`)}
                  </CardDescription>

                  <div className="mt-auto pt-4">
                    <Button
                      size="sm"
                      className="w-full"
                      variant={service.enabled ? "default" : "secondary"}
                      disabled={!service.enabled}
                      onClick={() =>
                        service.enabled && (window.location.href = service.href)
                      }
                    >
                      {service.enabled
                        ? t("home.accessService")
                        : t("home.comingSoon")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Status Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
            <p className="text-sm text-foreground">
              <strong>{t("home.systemStatus")}</strong> 3 services are currently
              available. Additional services will be launched progressively.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-semibold text-white mb-4">
                {t("footer.title")}
              </h3>
              <p className="text-sm text-white mb-4">
                {t("footer.description")}
              </p>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-white mb-4">
                {t("footer.contact")}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-white">
                  <Phone className="h-4 w-4" />
                  <span>+94 11 234 5678</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white">
                  <Mail className="h-4 w-4" />
                  <span>info@gov.lk</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white">
                  <MapPin className="h-4 w-4" />
                  <span>Colombo, Sri Lanka</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-white mb-4">
                {t("footer.legal")}
              </h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-sm text-white hover:text-muted-foreground"
                >
                  {t("footer.terms")}
                </a>
                <a
                  href="#"
                  className="block text-sm text-white hover:text-muted-foreground"
                >
                  {t("footer.privacy")}
                </a>
                <a
                  href="#"
                  className="block text-sm text-white hover:text-muted-foreground"
                >
                  {t("footer.cookies")}
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-white">{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
