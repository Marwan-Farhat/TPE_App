import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import { useTranslation } from "react-i18next";

const StartSection = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration submitted:", formData);
    setIsSubmitted(true);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <section id="start" className="py-20 lg:py-32 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-2xl mx-auto text-center bg-card rounded-3xl p-12 shadow-card border border-border"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            >
              <span className="text-4xl text-white">✓</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t("start.success.title")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("start.success.message")}
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/5"
              >
                {t("start.success.registerAnother")}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="start" className="py-14 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div 
          ref={sectionRef}
          className={`text-center max-w-3xl mx-auto mb-10 animate-fade-up ${isVisible ? "visible" : ""}`}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {t("start.title")}
          </h2>
          <p className="text-muted-foreground text-base">
            {t("start.subtitle")}
          </p>
        </div>

        {/* Registration Form */}
        <motion.div 
          className={`max-w-2xl mx-auto animate-fade-up ${isVisible ? "visible" : ""}`}
          style={{ transitionDelay: "150ms" }}
        >
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            {/* Form Header */}
            <div className="text-center py-8 px-6 border-b border-border">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {t("start.form.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("start.form.subtitle")}
              </p>
            </div>
            
            <div className="p-6 md:p-8">
              {/* Test Info Card */}
              <motion.div 
                className="bg-secondary/50 rounded-xl p-5 mb-8 border-s-4 border-primary"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-semibold text-foreground text-lg mb-1">
                  {t("start.form.testInfo.title")}
                </h4>
                <p className="text-muted-foreground text-sm mb-2">
                  {t("start.form.testInfo.description")}
                </p>
                <span className="text-primary font-semibold">{t("start.form.testInfo.price")}</span>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Fields */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground font-medium">
                      {t("start.form.fields.firstName")}
                    </Label>
                    <Input
                      id="firstName"
                      placeholder={t("start.form.fields.firstName")}
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      onFocus={() => setFocusedField("firstName")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`bg-background border-border transition-all duration-200 ${
                        focusedField === "firstName" ? "border-primary ring-2 ring-primary/20" : ""
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground font-medium">
                      {t("start.form.fields.lastName")}
                    </Label>
                    <Input
                      id="lastName"
                      placeholder={t("start.form.fields.lastName")}
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      onFocus={() => setFocusedField("lastName")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`bg-background border-border transition-all duration-200 ${
                        focusedField === "lastName" ? "border-primary ring-2 ring-primary/20" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    {t("start.form.fields.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`bg-background border-border transition-all duration-200 ${
                      focusedField === "email" ? "border-primary ring-2 ring-primary/20" : ""
                    }`}
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground font-medium">
                    {t("start.form.fields.phone")}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+20 123 456 7890"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`bg-background border-border transition-all duration-200 ${
                      focusedField === "phone" ? "border-primary ring-2 ring-primary/20" : ""
                    }`}
                  />
                </div>

                {/* Gender and Date of Birth */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      {t("start.form.fields.gender")}
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleChange("gender", value)}
                      required
                    >
                      <SelectTrigger className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200">
                        <SelectValue placeholder={t("start.form.fields.selectGender")} />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="male">{t("start.form.fields.male")}</SelectItem>
                        <SelectItem value="female">{t("start.form.fields.female")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-foreground font-medium">
                      {t("start.form.fields.dob")}
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                      onFocus={() => setFocusedField("dob")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className={`bg-background border-border transition-all duration-200 ${
                        focusedField === "dob" ? "border-primary ring-2 ring-primary/20" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gradient-primary text-white text-lg py-6 mt-4 btn-interactive"
                  >
                    {t("start.form.submit")}
                  </Button>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StartSection;