import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WEB_API } from "@/constants/apiConstants";
import apiClient from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// ---------- Options ----------
const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const bloodOptions = [
  { value: "A +", label: "A +" },
  { value: "A -", label: "A -" },
  { value: "B +", label: "B +" },
  { value: "B -", label: "B -" },
  { value: "O +", label: "O +" },
  { value: "O -", label: "O -" },
  { value: "AB +", label: "AB +" },
  { value: "AB -", label: "AB -" },
];

const identificationOptions = [
  { value: "Aadhar Card", label: "Aadhar Card" },
  { value: "PassPort", label: "PassPort" },
  { value: "Pan Card", label: "Pan Card" },
];

const marriedOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const mailAddressOptions = [
  { value: "Residence", label: "Residence" },
  { value: "Office", label: "Office" },
];

const yesorno = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

// ---------- Main Component ----------
const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiledoc, setSelectedFileDoc] = useState(null);

  // OTP dialog state
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    let interval;
    if (otpDialogOpen && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpDialogOpen, otpTimer]);

  // Active Select state (floating labels)
  const [activeSelect, setActiveSelect] = useState(null);

  const getLabelClass = (name, hasValue) => {
    const isOpen = activeSelect === name;
    const isFloating = hasValue || isOpen;
    return `absolute left-0 transition-all duration-200 pointer-events-none ${
      isFloating
        ? `top-3 translate-y-0 text-xs ${isOpen ? "text-primary" : "text-slate-400"}`
        : "top-1/2 -translate-y-1/2 text-sm text-slate-400"
    }`;
  };

  // ---------- Fetch Gotras & States ----------
  const { data: gotraData } = useQuery({
    queryKey: ["gotras"],
    queryFn: async () => {
      const response = await apiClient.get(WEB_API.fetchGotra);
      return response.data?.gotradata || [];
    },
  });
  const gottras = gotraData || [];

  const { data: stateData } = useQuery({
    queryKey: ["states"],
    queryFn: async () => {
      const response = await apiClient.get(WEB_API.fetchState);
      return response.data?.statedata || [];
    },
  });
  const states = stateData || [];

  // ---------- Form State (pre‑filled for testing) ----------
  const [formData, setFormData] = useState({
    // --- Personal ---
    appli_name: "",
    user_gender: "",
    user_mobile_number: "",
    user_qualification: "",
    user_proof_identification: "",
    appli_email: "",
    f_mgotra: "", // pick a gotra that exists in your list
    f_mdob: "",
    f_mblood: "",
    f_mstate: "", // pick a state that exists in your list
    native_place: "",

    // --- Contact ---
    residential_add: "", //residential
    residential_landmark: "",
    residential_city: "",
    residential_pin: "",
    office_add: "",
    office_landmark: "",
    office_city: "",
    office_pin: "",
    mailaddress: "",
    donate_blood: "",
    whats_app: "",
    user_resident_to_bang_since: "",

    // --- Family ---
    married: "",
    f_mannidate: "",
    spouse_name: "",
    user_pan_no: "",
    spouse_mobile: "", //spouse phone number
    spouse_dob: "", //date of birth
    f_msblood: "", //blood
    f_mfdob: "",
    f_mqualispouse: "", //qualification
    father_name: "", //father name
    father_mobile: "",
    f_nativeplace: "",

    // --- Introduction ---
    f_mintroby: "",
    f_mmemno: "",
    f_mintrophone: "",
    f_mintroadd: "",
    f_motherorga: "",
    org_name: "",
    org_type: "",

    // --- Miscellaneous ---

    // --- Membership ---
    priceaga: "5100.00", // or "11100.00"
  });

  const onInputChange = (e) => {
    const { name, value } = e.target;
    const digitFields = [
      "user_mobile_number",
      "spouse_mobile",
      "father_mobile",
      "residential_pin",
      "office_pin",
      "office_phone",
      "whats_app",
      "user_resident_to_bang_since",
      "f_mintrophone",
      "f_mmemno",
    ];
    if (digitFields.includes(name) && value !== "" && !/^\d*$/.test(value)) {
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (nameOrEvent, value) => {
    if (nameOrEvent && nameOrEvent.target) {
      const { name, value: val } = nameOrEvent.target;
      setFormData((prev) => ({ ...prev, [name]: val }));
    } else {
      setFormData((prev) => ({ ...prev, [nameOrEvent]: value }));
    }
  };

  // ---------- OTP Handlers ----------
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);
    if (value && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    try {
      const response = await apiClient.post(WEB_API.registerOtp, {
        appli_mno: formData.user_mobile_number,
      });
      if (response.data.code === 200 || response.data.code === "200") {
        toast.success("OTP resent successfully!");
        setOtpDigits(["", "", "", ""]);
        setOtpTimer(60);
        otpInputRefs[0].current?.focus();
      } else {
        toast.error(response.data.msg || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Error resending OTP");
    }
  };

  // ---------- Verify OTP & Submit Registration ----------
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join(""); // joins array into a single string, e.g. "1234"
    if (otp.length !== 4) {
      toast.error("Please enter the complete 4‑digit OTP");
      return;
    }

    setOtpLoading(true);
    try {
      const data = new FormData();

      // Map frontend UI names to backend API names
      const payloadMap = {
        user_gender: "appli_gender",
        user_mobile_number: "appli_mno",
        user_qualification: "f_mqualiself",
        user_proof_identification: "proof_iden",
        father_name: "f_mfname",
        father_mobile: "f_mfmno",
        residential_add: "f_mresadd",
        residential_landmark: "f_mresland",
        residential_city: "f_mrescity",
        residential_pin: "f_mrespin",
        office_add: "f_moffiadd",
        office_landmark: "f_moffiland",
        office_city: "f_mofficity",
        office_phone: "f_moffiphone", // adjust to backend key

        office_pin: "f_moffipin",
        spouse_name: "f_msname",
        spouse_mobile: "f_msmno",
        spouse_dob: "f_msdob",
        user_resident_to_bang_since: "f_mresibang",
        donate_blood: "donateblood",
        priceaga: "priceaga", // or "f_mprice" / "amount" — adjust to your API
      };

      // Append all text fields from formData mapping to backend keys
      Object.keys(formData).forEach((key) => {
        const val = formData[key];
        if (val !== null && val !== undefined && val !== "") {
          const mappedKey = payloadMap[key] || key;
          data.append(mappedKey, val);
        }
      });

      // Append OTP as a single string under field name "otpcode"
      data.append("otpcode", otp);

      // Append files
      if (selectedFile) {
        data.append("agrawal_image", selectedFile);
        data.append("agrawal_images", selectedFile);
      }
      if (selectedFiledoc) {
        data.append("upload_doc_proof", selectedFiledoc);
        data.append("upload_doc_proof", selectedFiledoc);
      }

      // Call the insert registration API
      const response = await apiClient.post(WEB_API.insertRegister, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.code === 200 || response.data.code === "200") {
        toast.success("Registration successful!");
        setOtpDialogOpen(false);
        navigate("/"); // or navigate to a success page
      } else {
        toast.error(
          response.data.msg || "Registration failed. Please try again.",
        );
        setOtpDigits(["", "", "", ""]);
        otpInputRefs[0].current?.focus();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.msg || "An error occurred during registration",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // ---------- Submit Form – Send OTP ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ----- Personal Information Validations -----
    if (!formData.appli_name) {
      toast.error("Name is required");
      return;
    }
    if (!formData.user_gender) {
      toast.error("Gender is required");
      return;
    }
    if (!formData.f_mgotra) {
      toast.error("Gotra is required");
      return;
    }
    if (!formData.f_mstate) {
      toast.error("State is required");
      return;
    }
    if (!formData.user_mobile_number) {
      toast.error("Mobile Number is required");
      return;
    }
    if (formData.user_mobile_number.length !== 10) {
      toast.error("Mobile Number must be 10 digits");
      return;
    }
    if (!formData.appli_email) {
      toast.error("Email Address is required");
      return;
    }
    if (!formData.f_mdob) {
      toast.error("Date of Birth is required");
      return;
    }
    if (!formData.user_qualification) {
      toast.error("Qualification is required");
      return;
    }
    if (!formData.user_proof_identification) {
      toast.error("Proof Identification is required");
      return;
    }
    if (!selectedFiledoc) {
      toast.error("Document proof is required");
      return;
    }
    if (!selectedFile) {
      toast.error("Profile image is required");
      return;
    }

    // ----- Family Information Validations -----
    if (!formData.user_pan_no) {
      toast.error("PAN No is required");
      return;
    }
    if (!formData.father_name) {
      toast.error("Father Name is required");
      return;
    }
    if (!formData.father_mobile) {
      toast.error("Father's Mobile No is required");
      return;
    }
    if (formData.father_mobile.length !== 10) {
      toast.error("Father's Mobile No must be 10 digits");
      return;
    }
    if (!formData.native_place) {
      toast.error("Native Place is required");
      return;
    }

    // ----- Contact Information Validations -----
    if (!formData.residential_add) {
      toast.error("Residential Address is required");
      return;
    }
    if (!formData.residential_landmark) {
      toast.error("Residential Landmark is required");
      return;
    }
    if (!formData.residential_city) {
      toast.error("Residential City is required");
      return;
    }
    if (!formData.residential_pin) {
      toast.error("Residential Pincode is required");
      return;
    }
    if (!formData.whats_app) {
      toast.error("WhatsApp number is required");
      return;
    }
    if (formData.whats_app.length !== 10) {
      toast.error("WhatsApp number must be 10 digits");
      return;
    }
    if (!formData.user_resident_to_bang_since) {
      toast.error("Resident in Bangalore since (Year) is required");
      return;
    }

    // ----- Introduction Information Validations -----
    if (!formData.f_mintroby) {
      toast.error("Introduced By (Member Name) is required");
      return;
    }
    if (!formData.f_mmemno) {
      toast.error("Membership No. of Introducer is required");
      return;
    }
    if (!formData.f_mintrophone) {
      toast.error("Phone No. of Introducer is required");
      return;
    }
    if (formData.f_mintrophone.length !== 10) {
      toast.error("Phone No. of Introducer must be 10 digits");
      return;
    }
    if (!formData.f_mintroadd) {
      toast.error("Address of Introducer is required");
      return;
    }

    // All validations passed – send OTP
    setLoading(true);
    try {
      const response = await apiClient.post(WEB_API.registerOtp, {
        appli_mno: formData.user_mobile_number,
      });
      if (response.data.code === 200 || response.data.code === "200") {
        toast.success("OTP sent successfully!");
        setOtpTimer(60);
        setOtpDialogOpen(true);
        // Focus first input after dialog opens
        setTimeout(() => otpInputRefs[0].current?.focus(), 100);
      } else {
        toast.error(response.data.msg || "Failed to send OTP.");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render ----------
  return (
    <div className="flex min-h-screen w-full bg-[rgb(207,195,194)]">
      <div className="min-h-screen w-full p-4 sm:p-6 md:p-8 flex items-center justify-center bg-gradient-to-br from-muted/30 to-background">
        <Card className="w-full max-w-7xl shadow-2xl mx-auto rounded-3xl overflow-hidden bg-white p-6 md:p-10 space-y-6">
          {/* Header */}
          <CardHeader className="p-0 pb-4 border-b flex flex-row items-center gap-4">
            <img
              src="https://new.agrawalsamaj.co/assets/logo-LrjSJo0H.png"
              alt="Logo"
              className="h-16 w-auto"
            />
          </CardHeader>

          <CardContent className="p-0">
            <form
              onSubmit={handleSubmit}
              className="space-y-8 animate-in fade-in duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                {/* Row 1 */}
                <div className="relative">
                  <Input
                    id="appli_name"
                    name="appli_name"
                    type="text"
                    placeholder=""
                    value={formData.appli_name}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="appli_name"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Name *
                  </label>
                </div>

                <div className="relative">
                  <Select
                    value={formData.user_gender}
                    onValueChange={(val) =>
                      handleSelectChange("user_gender", val)
                    }
                    onOpenChange={(open) =>
                      setActiveSelect(open ? "user_gender" : null)
                    }
                  >
                    <SelectTrigger className="h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label
                    className={getLabelClass(
                      "user_gender",
                      formData.user_gender,
                    )}
                  >
                    Gender *
                  </label>
                </div>

                <div className="relative">
                  <Select
                    value={formData.f_mgotra}
                    onValueChange={(val) => handleSelectChange("f_mgotra", val)}
                    onOpenChange={(open) =>
                      setActiveSelect(open ? "f_mgotra" : null)
                    }
                  >
                    <SelectTrigger className="h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {gottras
                        .filter((g) => g?.gotra_name)
                        .map((g) => (
                          <SelectItem key={g.gotra_name} value={g.gotra_name}>
                            {g.gotra_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <label
                    className={getLabelClass("f_mgotra", formData.f_mgotra)}
                  >
                    Gotra *
                  </label>
                </div>

                <div className="relative">
                  <Select
                    value={formData.f_mstate}
                    onValueChange={(val) => handleSelectChange("f_mstate", val)}
                    onOpenChange={(open) =>
                      setActiveSelect(open ? "f_mstate" : null)
                    }
                  >
                    <SelectTrigger className="h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {states
                        .filter((s) => s?.state_name)
                        .map((s) => (
                          <SelectItem key={s.state_name} value={s.state_name}>
                            {s.state_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <label
                    className={getLabelClass("f_mstate", formData.f_mstate)}
                  >
                    State *
                  </label>
                </div>

                {/* Row 2 */}
                <div className="relative">
                  <Input
                    id="user_mobile_number"
                    name="user_mobile_number"
                    type="tel"
                    placeholder=""
                    value={formData.user_mobile_number}
                    onChange={onInputChange}
                    required
                    maxLength={10}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="user_mobile_number"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Mobile No *
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="email"
                    name="appli_email"
                    type="email"
                    placeholder=""
                    value={formData.appli_email}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Email Address *
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="f_mdob"
                    name="f_mdob"
                    type="date"
                    value={formData.f_mdob}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="f_mdob"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-focus:text-primary"
                  >
                    Date of Birth *
                  </label>
                </div>

                <div className="relative">
                  <Select
                    value={formData.f_mblood}
                    onValueChange={(val) => handleSelectChange("f_mblood", val)}
                    onOpenChange={(open) =>
                      setActiveSelect(open ? "f_mblood" : null)
                    }
                  >
                    <SelectTrigger className="h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label
                    className={getLabelClass("f_mblood", formData.f_mblood)}
                  >
                    Blood Group
                  </label>
                </div>

                {/* Row 3 */}
                <div className="relative">
                  <Input
                    id="user_qualification"
                    name="user_qualification"
                    type="text"
                    placeholder=""
                    value={formData.user_qualification}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="user_qualification"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Qualification *
                  </label>
                </div>

                <div className="relative">
                  <Select
                    value={formData.user_proof_identification}
                    onValueChange={(val) =>
                      handleSelectChange("user_proof_identification", val)
                    }
                    onOpenChange={(open) =>
                      setActiveSelect(open ? "user_proof_identification" : null)
                    }
                  >
                    <SelectTrigger className="h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {identificationOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label
                    className={getLabelClass(
                      "user_proof_identification",
                      formData.user_proof_identification,
                    )}
                  >
                    Proof Identification *
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="user_proof_doc"
                    type="file"
                    required
                    onChange={(e) => setSelectedFileDoc(e.target.files[0])}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent text-slate-800 text-xs file:mr-2 file:py-1 file:px-2 file:border file:border-gray-300 file:rounded-md file:bg-gray-50 file:text-xs hover:file:bg-gray-100 shadow-none cursor-pointer"
                  />
                  <label
                    htmlFor="user_proof_doc"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-focus:text-primary"
                  >
                    Upload your document proof *
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="agrawal_image"
                    type="file"
                    required
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent text-slate-800 text-xs file:mr-2 file:py-1 file:px-2 file:border file:border-gray-300 file:rounded-md file:bg-gray-50 file:text-xs hover:file:bg-gray-100 shadow-none cursor-pointer"
                  />
                  <label
                    htmlFor="agrawal_image"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-focus:text-primary"
                  >
                    Profile image *
                  </label>
                </div>

                {/* FAMILY INFORMATION */}
                <div className="col-span-full border-b pb-2 mt-6">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Family Information
                  </h3>
                </div>

                <div className="relative">
                  <Input
                    id="user_pan_no"
                    name="user_pan_no"
                    type="text"
                    placeholder=""
                    value={formData.user_pan_no}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="user_pan_no"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    PAN No *
                  </label>
                </div>

                <div className="relative">
                  <Select
                    value={formData.married}
                    onValueChange={(val) => handleSelectChange("married", val)}
                    onOpenChange={(open) =>
                      setActiveSelect(open ? "married" : null)
                    }
                  >
                    <SelectTrigger className="h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {marriedOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label className={getLabelClass("married", formData.married)}>
                    Are you married *
                  </label>
                </div>

                {/* Conditional Spouse Fields */}
                {formData.married === "Yes" && (
                  <>
                    <div className="relative">
                      <Input
                        id="spouse_name"
                        name="spouse_name"
                        type="text"
                        placeholder=""
                        value={formData.spouse_name}
                        onChange={onInputChange}
                        className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                      />
                      <label
                        htmlFor="spouse_name"
                        className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Spouse Name
                      </label>
                    </div>

                    <div className="relative">
                      <Input
                        id="spouse_mobile"
                        name="spouse_mobile"
                        type="tel"
                        placeholder=""
                        value={formData.spouse_mobile}
                        onChange={onInputChange}
                        maxLength={10}
                        className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                      />
                      <label
                        htmlFor="spouse_mobile"
                        className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Spouse Mobile No
                      </label>
                    </div>

                    <div className="relative">
                      <Input
                        id="spouse_dob"
                        name="spouse_dob"
                        type="date"
                        value={formData.spouse_dob}
                        onChange={onInputChange}
                        className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                      />
                      <label
                        htmlFor="spouse_dob"
                        className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-focus:text-primary"
                      >
                        Spouse DOB
                      </label>
                    </div>

                    <div className="relative">
                      <Input
                        id="f_mannidate"
                        name="f_mannidate"
                        type="date"
                        value={formData.f_mannidate}
                        onChange={onInputChange}
                        className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                      />
                      <label
                        htmlFor="f_mannidate"
                        className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-focus:text-primary"
                      >
                        Spouse Anniversary Date
                      </label>
                    </div>
                  </>
                )}

                <div className="relative col-span-1">
                  <Input
                    id="father_name"
                    name="father_name"
                    type="text"
                    placeholder=""
                    value={formData.father_name}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="father_name"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Father Name *
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="f_mfdob"
                    name="f_mfdob"
                    type="date"
                    value={formData.f_mfdob}
                    onChange={onInputChange}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="father_dob"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-focus:text-primary"
                  >
                    DOB
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="father_mobile"
                    name="father_mobile"
                    type="tel"
                    placeholder=""
                    value={formData.father_mobile}
                    onChange={onInputChange}
                    required
                    maxLength={10}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="father_mobile"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Father's Mobile No *
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="native_place"
                    name="native_place"
                    type="text"
                    placeholder=""
                    value={formData.native_place}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="native_place"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Nativeplace *
                  </label>
                </div>

                {/* CONTACT */}
                <div className="col-span-full border-b pb-2 mt-6">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Contact
                  </h3>
                </div>

                <div className="relative col-span-full">
                  <Input
                    id="residential_add"
                    name="residential_add"
                    type="text"
                    placeholder=""
                    value={formData.residential_add}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent w-full"
                  />
                  <label
                    htmlFor="residential_add"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Residential Address *
                  </label>
                </div>

                <div className="relative col-span-1 md:col-span-2">
                  <Input
                    id="residential_landmark"
                    name="residential_landmark"
                    type="text"
                    placeholder=""
                    value={formData.residential_landmark}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="residential_landmark"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Landmark *
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="residential_city"
                    name="residential_city"
                    type="text"
                    placeholder=""
                    value={formData.residential_city}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="residential_city"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    City *
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="residential_pin"
                    name="residential_pin"
                    type="text"
                    placeholder=""
                    value={formData.residential_pin}
                    onChange={onInputChange}
                    required
                    maxLength={6}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="residential_pin"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Pincode *
                  </label>
                </div>

                <div className="relative col-span-full">
                  <Input
                    id="office_add"
                    name="office_add"
                    type="text"
                    placeholder=""
                    value={formData.office_add}
                    onChange={onInputChange}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent w-full"
                  />
                  <label
                    htmlFor="office_add"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Office Address
                  </label>
                </div>

                <div className="relative col-span-1 md:col-span-2">
                  <Input
                    id="office_landmark"
                    name="office_landmark"
                    type="text"
                    placeholder=""
                    value={formData.office_landmark}
                    onChange={onInputChange}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="office_landmark"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Landmark
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="office_city"
                    name="office_city"
                    type="text"
                    placeholder=""
                    value={formData.office_city}
                    onChange={onInputChange}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="office_city"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    City
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="office_pin"
                    name="office_pin"
                    type="text"
                    placeholder=""
                    value={formData.office_pin}
                    onChange={onInputChange}
                    maxLength={6}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="office_pin"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Pincode
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="office_phone"
                    name="office_phone"
                    type="text"
                    placeholder=""
                    value={formData.office_phone}
                    onChange={onInputChange}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="office_phone"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Office No
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="whats_app"
                    name="whats_app"
                    type="tel"
                    placeholder=""
                    value={formData.whats_app}
                    onChange={onInputChange}
                    required
                    maxLength={10}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="whats_app"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Whats App *
                  </label>
                </div>

                <div className="relative">
                  <Select
                    value={formData.mailaddress}
                    onValueChange={(val) =>
                      handleSelectChange("mailaddress", val)
                    }
                    onOpenChange={(open) =>
                      setActiveSelect(open ? "mailaddress" : null)
                    }
                  >
                    <SelectTrigger className="h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {mailAddressOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label
                    className={getLabelClass(
                      "mailaddress",
                      formData.mailaddress,
                    )}
                  >
                    Mail Address *
                  </label>
                </div>

                <div className="relative">
                  <Input
                    id="user_resident_to_bang_since"
                    name="user_resident_to_bang_since"
                    type="text"
                    placeholder=""
                    value={formData.user_resident_to_bang_since}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="user_resident_to_bang_since"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Since Resident in Bangalore (Year) *
                  </label>
                </div>

                <div className="relative">
                  <Select
                    value={formData.donate_blood}
                    onValueChange={(val) =>
                      handleSelectChange("donate_blood", val)
                    }
                    onOpenChange={(open) =>
                      setActiveSelect(open ? "donate_blood" : null)
                    }
                  >
                    <SelectTrigger className="h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {yesorno.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label
                    className={getLabelClass(
                      "donate_blood",
                      formData.donate_blood,
                    )}
                  >
                    Donate Blood *
                  </label>
                </div>

                {/* INTRODUCTION */}
                <div className="col-span-full border-b pb-2 mt-6">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Introduction
                  </h3>
                </div>

                <div className="relative col-span-1 md:col-span-2">
                  <Input
                    id="f_mintroby"
                    name="f_mintroby"
                    type="text"
                    placeholder=""
                    value={formData.f_mintroby}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="f_mintroby"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Introducd By (Member Name) *
                  </label>
                </div>

                <div className="relative col-span-1">
                  <Input
                    id="f_mmemno"
                    name="f_mmemno"
                    type="text"
                    placeholder=""
                    value={formData.f_mmemno}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="f_mmemno"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Membership No. of Introducer *
                  </label>
                </div>

                <div className="relative col-span-1">
                  <Input
                    id="f_mintrophone"
                    name="f_mintrophone"
                    type="tel"
                    placeholder=""
                    value={formData.f_mintrophone}
                    onChange={onInputChange}
                    required
                    maxLength={10}
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="f_mintrophone"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Phone No. of Introducer *
                  </label>
                </div>

                <div className="relative col-span-1 md:col-span-2">
                  <Input
                    id="f_mintroadd"
                    name="f_mintroadd"
                    type="text"
                    placeholder=""
                    value={formData.f_mintroadd}
                    onChange={onInputChange}
                    required
                    className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                  />
                  <label
                    htmlFor="f_mintroadd"
                    className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                  >
                    Address of Introducer *
                  </label>
                </div>

                <div className="relative">
                  <Select
                    value={formData.f_motherorga}
                    onValueChange={(val) =>
                      handleSelectChange("f_motherorga", val)
                    }
                    onOpenChange={(open) =>
                      setActiveSelect(open ? "f_motherorga" : null)
                    }
                  >
                    <SelectTrigger className="h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      {yesorno.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label
                    className={getLabelClass(
                      "f_motherorga",
                      formData.f_motherorga,
                    )}
                  >
                    Member of any Other Organizations *
                  </label>
                </div>

                {formData.f_motherorga === "Yes" && (
                  <>
                    <div className="relative">
                      <Input
                        id="org_name"
                        name="org_name"
                        type="text"
                        placeholder=""
                        value={formData.org_name}
                        onChange={onInputChange}
                        className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                      />
                      <label
                        htmlFor="org_name"
                        className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Organization Name
                      </label>
                    </div>

                    <div className="relative">
                      <Input
                        id="org_type"
                        name="org_type"
                        type="text"
                        placeholder=""
                        value={formData.org_type}
                        onChange={onInputChange}
                        className="peer h-14 pt-6 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                      />
                      <label
                        htmlFor="org_type"
                        className="absolute left-0 top-3 text-xs text-slate-400 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Organization Type
                      </label>
                    </div>
                  </>
                )}

                {/* MEMBERSHIP FEES OPTIONS */}
                <div className="col-span-full border-t pt-6 mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                  <div className="flex flex-col lg:flex-row gap-4 w-full">
                    {/* Life Member */}
                    <label className="flex items-center justify-between cursor-pointer w-full bg-white p-4 sm:p-5 rounded-2xl border hover:border-rose-400 transition-all shadow-sm">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <input
                          type="radio"
                          name="membership_plan"
                          value="5100.00"
                          checked={formData.membership_plan === "5100.00"}
                          onChange={onInputChange}
                          className="w-5 h-5 min-w-[20px] text-rose-600 border-gray-300 focus:ring-rose-500"
                        />
                        <div>
                          <span className="font-bold text-slate-800 text-sm sm:text-base block mb-0.5">
                            Life Member
                          </span>
                          <span className="text-xs sm:text-sm text-slate-500 block leading-tight">
                            Entry Fee: 100.00 | Membership: 5,000.00
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 text-sm sm:text-lg ml-2 whitespace-nowrap">
                        ₹ 5,100.00
                      </span>
                    </label>

                    {/* Patron Life Member */}
                    <label className="flex items-center justify-between cursor-pointer w-full bg-white p-4 sm:p-5 rounded-2xl border hover:border-rose-400 transition-all shadow-sm">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <input
                          type="radio"
                          name="membership_plan"
                          value="11100.00"
                          checked={formData.membership_plan === "11100.00"}
                          onChange={onInputChange}
                          className="w-5 h-5 min-w-[20px] text-rose-600 border-gray-300 focus:ring-rose-500"
                        />
                        <div>
                          <span className="font-bold text-slate-800 text-sm sm:text-base block mb-0.5">
                            Patron Life Member
                          </span>
                          <span className="text-xs sm:text-sm text-slate-500 block leading-tight">
                            Entry Fee: 100.00 | Membership: 11,000.00
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 text-sm sm:text-lg ml-2 whitespace-nowrap">
                        ₹ 11,100.00
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
                <Link
                  to="/"
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800 order-2 sm:order-1"
                >
                  Already a member? Login
                </Link>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto h-12 bg-rose-700 hover:bg-rose-600 text-white rounded-xl px-8 shadow-lg shadow-rose-100 font-bold transition-all active:scale-95 order-1 sm:order-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </span>
                  ) : (
                    "Send Otp"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-md p-5 sm:p-6 rounded-2xl mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Verify OTP
            </DialogTitle>
            <DialogDescription className="text-center">
              Enter the 4‑digit code sent to{" "}
              <span className="font-medium text-slate-800">
                {formData.user_mobile_number}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 sm:py-6 flex justify-center gap-2 sm:gap-4">
            {[0, 1, 2, 3].map((index) => (
              <Input
                key={index}
                ref={otpInputRefs[index]}
                type="text"
                maxLength={1}
                value={otpDigits[index]}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-12 sm:w-16 sm:h-16 text-center text-xl sm:text-3xl font-bold border-2 border-slate-200 focus:border-rose-500 rounded-xl sm:rounded-2xl transition-all"
                autoFocus={index === 0}
              />
            ))}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full">
            <Button
              variant="outline"
              onClick={handleResendOtp}
              className="rounded-xl w-full sm:w-auto"
              disabled={otpLoading || otpTimer > 0}
            >
              {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
            </Button>
            <Button
              onClick={handleVerifyOtp}
              disabled={otpLoading || otpDigits.join("").length !== 4}
              className="bg-rose-700 hover:bg-rose-600 text-white rounded-xl font-bold w-full sm:w-auto"
            >
              {otpLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </span>
              ) : (
                "Verify"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
