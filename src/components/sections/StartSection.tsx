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
          <div className="max-w-2xl mx-auto text-center bg-card rounded-3xl p-12 shadow-card border border-border">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-white">✓</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Registration Successful!
            </h2>
            <p className="text-muted-foreground mb-8">
              We've received your registration. Our team will contact you within 
              24 hours to confirm your placement test booking and payment details.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="border-primary text-primary"
            >
              Register another person
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="start" className="py-14 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Start Your Journey Now
          </h2>
          <p className="text-muted-foreground text-base">
            Register for the placement test and book your free session
          </p>
        </div>

        {/* Registration Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            {/* Form Header */}
            <div className="text-center py-8 px-6 border-b border-border">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Placement Test Registration
              </h3>
              <p className="text-muted-foreground">
                Complete the registration to proceed to payment
              </p>
            </div>
            
            <div className="p-6 md:p-8">
              {/* Test Info Card */}
              <div className="bg-secondary/50 rounded-xl p-5 mb-8 border-l-4 border-primary">
                <h4 className="font-semibold text-foreground text-lg mb-1">
                  English Placement Test 2025
                </h4>
                <p className="text-muted-foreground text-sm mb-2">
                  Comprehensive English language assessment test
                </p>
                <span className="text-primary font-semibold">100 EGP</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Fields */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    className="bg-background border-border"
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+20 123 456 7890"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                    className="bg-background border-border"
                  />
                </div>

                {/* Gender and Date of Birth */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Gender
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleChange("gender", value)}
                      required
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-foreground font-medium">
                      Date of Birth
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                      required
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gradient-primary text-white text-lg py-6 mt-4"
                >
                  Register
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StartSection;
