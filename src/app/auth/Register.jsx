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

  // ---------- Validation Errors ----------
  const [errors, setErrors] = useState({});

  const getLabelClass = (name, hasValue) => {
    const isOpen = activeSelect === name;
    const isFloating = hasValue || isOpen;
    return `absolute left-0 transition-all duration-200 pointer-events-none ${
      isFloating
        ? `top-3 translate-y-0 text-xs ${isOpen ? "text-primary" : "text-slate-500"}`
        : "top-1/2 -translate-y-1/2 text-sm text-slate-500"
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

  // ---------- Form State ----------
  const [formData, setFormData] = useState({
    appli_name: "",
    user_gender: "",
    user_mobile_number: "",
    user_qualification: "",
    user_proof_identification: "",
    appli_email: "",
    f_mgotra: "",
    f_mdob: "",
    f_mblood: "",
    f_mstate: "",
    native_place: "",
    residential_add: "",
    residential_landmark: "",
    residential_city: "",
    residential_pin: "",
    office_add: "",
    office_landmark: "",
    office_city: "",
    office_pin: "",
    office_phone: "",
    mailaddress: "",
    donate_blood: "",
    whats_app: "",
    user_resident_to_bang_since: "",
    married: "",
    f_mannidate: "",
    spouse_name: "",
    user_pan_no: "",
    spouse_mobile: "",
    spouse_dob: "",
    f_mfdob: "",
    father_name: "",
    father_mobile: "",
    f_mintroby: "",
    f_mmemno: "",
    f_mintrophone: "",
    f_mintroadd: "",
    f_motherorga: "",
    org_name: "",
    org_type: "",
    priceaga: "5100",
  });

  // ---------- Individual field validators ----------
  const fieldValidators = {
    appli_name: (val) => {
      if (!val) return "Name is required";
      if (val.length < 2) return "Name must be at least 2 characters";
      return null;
    },
    user_gender: (val) => (!val ? "Gender is required" : null),
    f_mgotra: (val) => (!val ? "Gotra is required" : null),
    f_mstate: (val) => (!val ? "State is required" : null),
    user_mobile_number: (val) => {
      if (!val) return "Mobile Number is required";
      if (!/^\d{10}$/.test(val))
        return "Mobile Number must be exactly 10 digits";
      if (/^(\d)\1{9}$/.test(val))
        return "Invalid mobile number (repeated digits)";
      return null;
    },
    appli_email: (val) => {
      if (!val) return "Email Address is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
        return "Enter a valid email address";
      return null;
    },
    f_mdob: (val) => {
      if (!val) return "Date of Birth is required";
      const dob = new Date(val);
      if (dob > new Date()) return "Date of Birth cannot be in the future";
      return null;
    },
    user_qualification: (val) => (!val ? "Qualification is required" : null),
    user_proof_identification: (val) =>
      !val ? "Proof Identification is required" : null,
    document_proof: (val) => (!val ? "Document proof is required" : null),
    profile_image: (val) => (!val ? "Profile image is required" : null),
    user_pan_no: (val) => {
      if (!val) return "PAN No is required";
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val))
        return "Enter a valid PAN (e.g., ABCDE1234F)";
      return null;
    },
    father_name: (val) => {
      if (!val) return "Father Name is required";
      if (val.length < 2) return "Father name must be at least 2 characters";
      return null;
    },
    f_mfdob: (val) => {
      if (!val) return null; // optional field – no error if empty
      const dob = new Date(val);
      if (isNaN(dob.getTime())) return "Invalid date";
      if (dob > new Date())
        return "Father's Date of Birth cannot be in the future";
      return null;
    },

    father_mobile: (val) => {
      if (!val) return "Father's Mobile No is required";
      if (!/^[6-9]\d{9}$/.test(val)) return "Enter a 10-digit mobile number";
      if (/^(\d)\1{9}$/.test(val))
        return "Invalid mobile number (repeated digits)";
      return null;
    },
    native_place: (val) => {
      if (!val) return "Native Place is required";
      if (val.length < 2) return "Native Place must be at least 2 characters";
      return null;
    },
    residential_add: (val) => {
      if (!val) return "Residential Address is required";
      if (val.length < 3) return "Address must be at least 3 characters";
      return null;
    },
    residential_landmark: (val) => {
      if (!val) return "Residential Landmark is required";
      if (val.length < 2) return "Landmark must be at least 2 characters";
      return null;
    },
    residential_city: (val) => {
      if (!val) return "Residential City is required";
      if (val.length < 2) return "City must be at least 2 characters";
      return null;
    },
    residential_pin: (val) => {
      if (!val) return "Residential Pincode is required";
      if (!/^[1-9][0-9]{5}$/.test(val))
        return "Enter a valid 6-digit pincode (first digit cannot be 0)";
      return null;
    },
    whats_app: (val) => {
      if (!val) return "WhatsApp number is required";
      if (val.length !== 10) return "WhatsApp number must be 10 digits";
      return null;
    },
    user_resident_to_bang_since: (val) => {
      if (!val) return "Resident in Bangalore since (Year) is required";
      const year = parseInt(val);
      const currentYear = new Date().getFullYear();
      if (!/^\d{4}$/.test(val) || year < 1900 || year > currentYear) {
        return `Enter a valid year (1900 - ${currentYear})`;
      }
      return null;
    },
    f_mintroby: (val) => {
      if (!val) return "Introduced By (Member Name) is required";
      if (val.length < 2)
        return "Introducer name must be at least 2 characters";
      return null;
    },
    f_mmemno: (val) =>
      !val ? "Membership No. of Introducer is required" : null,
    f_mintrophone: (val) => {
      if (!val) return "Phone No. of Introducer is required";
      if (val.length !== 10) return "Phone No. of Introducer must be 10 digits";
      return null;
    },
    f_mintroadd: (val) => {
      if (!val) return "Address of Introducer is required";
      if (val.length < 3) return "Address must be at least 3 characters";
      return null;
    },
    spouse_name: (val, formData) => {
      if (formData.married !== "Yes") return null;
      return null;
    },
    spouse_mobile: (val, formData) => {
      if (formData.married !== "Yes") return null;
      if (val && !/^[6-9]\d{9}$/.test(val))
        return "Enter a 10-digit mobile number starting with 6-9";
      return null;
    },
    spouse_dob: (val, formData) => {
      if (formData.married !== "Yes") return null;
      if (val && new Date(val) > new Date())
        return "Date of Birth cannot be in the future";
      return null;
    },
    f_mannidate: (val, formData) => {
      if (formData.married !== "Yes") return null;
      if (val && new Date(val) > new Date())
        return "Anniversary date cannot be in the future";
      return null;
    },
    org_name: (val, formData) => {
      if (formData.f_motherorga !== "Yes") return null;
      if (!val) return "Organization Name is required";
      return null;
    },
    org_type: (val, formData) => {
      if (formData.f_motherorga !== "Yes") return null;
      if (!val) return "Organization Type is required";
      return null;
    },
    f_mblood: () => null,
    office_add: () => null,
    office_landmark: () => null,
    office_city: () => null,
    office_pin: () => null,
    office_phone: () => null,
    mailaddress: () => null,
    donate_blood: () => null,
    priceaga: () => null,
    married: () => null,
  };

  // Validate a single field
  const validateField = (field, value, currentFormData = formData) => {
    const validator = fieldValidators[field];
    if (!validator) return null;
    const error = validator(value, currentFormData);
    return error || null;
  };

  // ---------- Full Form Validation (used on submit) ----------
  const validateForm = () => {
    const err = {};
    const requiredFields = [
      "appli_name",
      "user_gender",
      "f_mgotra",
      "f_mstate",
      "user_mobile_number",
      "appli_email",
      "f_mdob",
      "user_qualification",
      "user_proof_identification",
      "user_pan_no",
      "father_name",
      "father_mobile",
      "native_place",
      "residential_add",
      "residential_landmark",
      "residential_city",
      "residential_pin",
      "whats_app",
      "user_resident_to_bang_since",
      "f_mintroby",
      "f_mmemno",
      "f_mintrophone",
      "f_mintroadd",
      "married",
      "donate_blood",
      "mailaddress",
    ];

    requiredFields.forEach((field) => {
      const value = formData[field];
      const error = validateField(field, value, formData);
      if (error) err[field] = error;
    });

    if (!selectedFiledoc) err.document_proof = "Document proof is required";
    if (!selectedFile) err.profile_image = "Profile image is required";

    if (formData.married === "Yes") {
      ["spouse_name", "spouse_mobile", "spouse_dob", "f_mannidate"].forEach(
        (field) => {
          const value = formData[field];
          const error = validateField(field, value, formData);
          if (error) err[field] = error;
        },
      );
    }

    if (formData.f_motherorga === "Yes") {
      ["org_name", "org_type"].forEach((field) => {
        const value = formData[field];
        const error = validateField(field, value, formData);
        if (error) err[field] = error;
      });
    }

    return err;
  };

  // ---------- Handlers with real-time validation ----------
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

    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    const error = validateField(name, value, newFormData);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSelectChange = (name, value) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    const error = validateField(name, value, newFormData);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (name === "married" && value === "No") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        ["spouse_name", "spouse_mobile", "spouse_dob", "f_mannidate"].forEach(
          (f) => delete newErrors[f],
        );
        return newErrors;
      });
    }

    if (name === "f_motherorga" && value === "No") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        ["org_name", "org_type"].forEach((f) => delete newErrors[f]);
        return newErrors;
      });
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "doc") {
      setSelectedFileDoc(file);
      const error = validateField("document_proof", file);
      setErrors((prev) => ({ ...prev, document_proof: error }));
    } else {
      setSelectedFile(file);
      const error = validateField("profile_image", file);
      setErrors((prev) => ({ ...prev, profile_image: error }));
    }
  };

  const handleDialogOpenChange = (open) => {
    setOtpDialogOpen(open);
    if (!open) {
      setOtpDigits(["", "", "", ""]);
      setOtpTimer(60);
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

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 4) {
      toast.error("Please enter the complete 4‑digit OTP");
      return;
    }

    setOtpLoading(true);
    try {
      const data = new FormData();

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
        office_pin: "f_moffipin",
        office_phone: "f_moffiphone",
        spouse_name: "f_msname",
        spouse_mobile: "f_msmno",
        spouse_dob: "f_msdob",
        user_resident_to_bang_since: "f_mresibang",
        donate_blood: "donateblood",
        priceaga: "priceaga",
      };

      Object.keys(formData).forEach((key) => {
        const val = formData[key];
        if (val !== null && val !== undefined && val !== "") {
          const mappedKey = payloadMap[key] || key;
          data.append(mappedKey, val);
        }
      });

      data.append("otpcode", otp);

      if (selectedFile) {
        data.append("agrawal_image", selectedFile);
        data.append("agrawal_images", selectedFile);
      }
      if (selectedFiledoc) {
        data.append("upload_doc_proof", selectedFiledoc);
        data.append("upload_doc_proof", selectedFiledoc);
      }

      const response = await apiClient.post(WEB_API.insertRegister, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.code === 200 || response.data.code === "200") {
        toast.success("Registration successful!");
        setOtpDialogOpen(false);
        navigate("/");
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

  // ---------- Focus helper (no CSS class dependency) ----------
  const focusFirstInvalidField = (errors) => {
    // Order of fields in the form (top to bottom)
    const fieldOrder = [
      "appli_name",
      "user_gender",
      "f_mgotra",
      "f_mstate",
      "user_mobile_number",
      "appli_email",
      "f_mdob",
      "f_mblood",
      "user_qualification",
      "user_proof_identification",
      "document_proof", // file input
      "profile_image", // file input
      "user_pan_no",
      "married",
      "spouse_name",
      "spouse_mobile",
      "spouse_dob",
      "f_mannidate",
      "father_name",
      "f_mfdob",
      "father_mobile",
      "native_place",
      "residential_add",
      "residential_landmark",
      "residential_city",
      "residential_pin",
      "office_add",
      "office_landmark",
      "office_city",
      "office_pin",
      "office_phone",
      "whats_app",
      "mailaddress",
      "user_resident_to_bang_since",
      "donate_blood",
      "f_mintroby",
      "f_mmemno",
      "f_mintrophone",
      "f_mintroadd",
      "f_motherorga",
      "org_name",
      "org_type",
    ];

    for (const field of fieldOrder) {
      if (errors[field]) {
        let element = null;

        // Handle file inputs
        if (field === "document_proof") {
          element = document.getElementById("user_proof_doc");
        } else if (field === "profile_image") {
          element = document.getElementById("agrawal_image");
        } else {
          // Try by id, then data-field, then name
          element = document.getElementById(field);
          if (!element) {
            element = document.querySelector(`[data-field="${field}"]`);
          }
          if (!element) {
            element = document.querySelector(`[name="${field}"]`);
          }
        }

        if (element) {
          element.focus({ preventScroll: true });
          element.scrollIntoView({ behavior: "smooth", block: "center" });

          // If it's a select trigger, open the dropdown
          if (
            element.tagName === "BUTTON" &&
            element.closest("[role='combobox']")
          ) {
            setTimeout(() => {
              element.click();
            }, 300);
          }

          // Shake animation for visibility
          element.classList.add("error-highlight");
          setTimeout(() => {
            element.classList.remove("error-highlight");
          }, 500);

          return; // stop after first error
        }
      }
    }
  };

  // ---------- Submit Form – Send OTP (modified) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      // Do NOT set errors state – only focus on the first invalid field
      focusFirstInvalidField(validationErrors);
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
    <>
      <style>{`
      @keyframes errorShake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }
      .error-highlight {
         animation: errorShake 1.0s ease !important;
      }
    `}</style>

      <div className="flex min-h-screen w-full bg-[rgb(207,195,194)]">
        <div className="min-h-screen w-full p-4 sm:p-6 md:p-8 flex items-center justify-center bg-gradient-to-br from-muted/30 to-background">
          <Card className="w-full max-w-7xl shadow-2xl mx-auto rounded-3xl overflow-hidden bg-white p-6 md:p-10 space-y-6">
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
                noValidate
                className="space-y-8 animate-in fade-in duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                  {/* Row 1 */}
                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="appli_name"
                        name="appli_name"
                        required
                        type="text"
                        placeholder=""
                        value={formData.appli_name}
                        onChange={onInputChange}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.appli_name
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="appli_name"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Name <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.appli_name && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.appli_name}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Select
                        value={formData.user_gender}
                        required
                        onValueChange={(val) =>
                          handleSelectChange("user_gender", val)
                        }
                        onOpenChange={(open) =>
                          setActiveSelect(open ? "user_gender" : null)
                        }
                      >
                        <SelectTrigger
                          data-field="user_gender"
                          className={`h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none ring-0 focus:ring-0 data-[state=open]:ring-0 ${
                            errors.user_gender
                              ? "border-b-red-500"
                              : "border-b-gray-300"
                          }`}
                        >
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={4}
                          className="border-0 shadow-lg ring-1 ring-slate-100 rounded-xl"
                        >
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
                        Gender <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.user_gender && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.user_gender}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Select
                        value={formData.f_mgotra}
                        onValueChange={(val) =>
                          handleSelectChange("f_mgotra", val)
                        }
                        onOpenChange={(open) =>
                          setActiveSelect(open ? "f_mgotra" : null)
                        }
                      >
                        <SelectTrigger
                          data-field="f_mgotra"
                          className={`h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none ring-0 focus:ring-0 data-[state=open]:ring-0 ${
                            errors.f_mgotra
                              ? "border-b-red-500"
                              : "border-b-gray-300"
                          }`}
                        >
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={4}
                          className="border-0 shadow-lg ring-1 ring-slate-100 rounded-xl"
                        >
                          {gottras
                            .filter((g) => g?.gotra_name)
                            .map((g) => (
                              <SelectItem
                                key={g.gotra_name}
                                value={g.gotra_name}
                              >
                                {g.gotra_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <label
                        className={getLabelClass("f_mgotra", formData.f_mgotra)}
                      >
                        Gotra <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.f_mgotra && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.f_mgotra}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Select
                        value={formData.f_mstate}
                        onValueChange={(val) =>
                          handleSelectChange("f_mstate", val)
                        }
                        onOpenChange={(open) =>
                          setActiveSelect(open ? "f_mstate" : null)
                        }
                      >
                        <SelectTrigger
                          data-field="f_mstate"
                          className={`h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all bg-transparent flex justify-between items-center w-full shadow-none ring-0 focus:ring-0 data-[state=open]:ring-0 ${
                            errors.f_mstate
                              ? "border-b-red-500"
                              : "border-b-gray-300"
                          }`}
                        >
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={4}
                          className="border-0 shadow-lg ring-1 ring-slate-100 rounded-xl"
                        >
                          {states
                            .filter((s) => s?.state_name)
                            .map((s) => (
                              <SelectItem
                                key={s.state_name}
                                value={s.state_name}
                              >
                                {s.state_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <label
                        className={getLabelClass("f_mstate", formData.f_mstate)}
                      >
                        State <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.f_mstate && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.f_mstate}
                      </div>
                    )}
                  </div>

                  {/* Row 2 */}
                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="user_mobile_number"
                        name="user_mobile_number"
                        type="tel"
                        placeholder=""
                        value={formData.user_mobile_number}
                        onChange={onInputChange}
                        maxLength={10}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.user_mobile_number
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="user_mobile_number"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Mobile No <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.user_mobile_number && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.user_mobile_number}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="appli_email"
                        name="appli_email"
                        type="email"
                        placeholder=""
                        value={formData.appli_email}
                        onChange={onInputChange}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.appli_email
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="appli_email"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.appli_email && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.appli_email}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="f_mdob"
                        name="f_mdob"
                        type="date"
                        value={formData.f_mdob}
                        onChange={onInputChange}
                        max={new Date().toISOString().split("T")[0]}
                        className={`peer h-14 pt-7 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.f_mdob
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="f_mdob"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-focus:text-primary"
                      >
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.f_mdob && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.f_mdob}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Select
                        value={formData.f_mblood}
                        onValueChange={(val) =>
                          handleSelectChange("f_mblood", val)
                        }
                        onOpenChange={(open) =>
                          setActiveSelect(open ? "f_mblood" : null)
                        }
                      >
                        <SelectTrigger
                          data-field="f_mblood"
                          className={`h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none ring-0 focus:ring-0 data-[state=open]:ring-0 ${
                            errors.f_mblood
                              ? "border-b-red-500"
                              : "border-b-gray-300"
                          }`}
                        >
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={4}
                          className="border-0 shadow-lg ring-1 ring-slate-100 rounded-xl"
                        >
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
                    {errors.f_mblood && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.f_mblood}
                      </div>
                    )}
                  </div>

                  {/* Row 3 */}
                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="user_qualification"
                        name="user_qualification"
                        type="text"
                        placeholder=""
                        value={formData.user_qualification}
                        onChange={onInputChange}
                        required
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.user_qualification
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="user_qualification"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Qualification <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.user_qualification && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.user_qualification}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Select
                        value={formData.user_proof_identification}
                        onValueChange={(val) =>
                          handleSelectChange("user_proof_identification", val)
                        }
                        onOpenChange={(open) =>
                          setActiveSelect(
                            open ? "user_proof_identification" : null,
                          )
                        }
                      >
                        <SelectTrigger
                          data-field="user_proof_identification"
                          className={`h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none ring-0 focus:ring-0 data-[state=open]:ring-0 ${
                            errors.user_proof_identification
                              ? "border-b-red-500"
                              : "border-b-gray-300"
                          }`}
                        >
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={4}
                          className="border-0 shadow-lg ring-1 ring-slate-100 rounded-xl"
                        >
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
                        Proof Identification{" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.user_proof_identification && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.user_proof_identification}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="user_proof_doc"
                        type="file"
                        onChange={(e) => handleFileChange(e, "doc")}
                        className={`peer h-14 pt-6 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent text-slate-800 text-xs file:mr-2 file:py-1 file:px-2 file:border file:border-gray-300 file:rounded-md file:bg-gray-50 file:text-xs hover:file:bg-gray-100 shadow-none cursor-pointer ${
                          errors.document_proof
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="user_proof_doc"
                        className="absolute left-0 bottom-10 text-[10px] text-slate-500 transition-all duration-200 peer-focus:text-primary"
                      >
                        Upload your document proof{" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.document_proof && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.document_proof}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="agrawal_image"
                        type="file"
                        onChange={(e) => handleFileChange(e, "image")}
                        className={`peer h-14 pt-6 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent text-slate-800 text-xs file:mr-2 file:py-1 file:px-2 file:border file:border-gray-300 file:rounded-md file:bg-gray-50 file:text-xs hover:file:bg-gray-100 shadow-none cursor-pointer ${
                          errors.profile_image
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="agrawal_image"
                        className="absolute left-0 bottom-10 text-[10px] text-slate-500 transition-all duration-200 peer-focus:text-primary"
                      >
                        Profile image <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.profile_image && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.profile_image}
                      </div>
                    )}
                  </div>

                  {/* FAMILY INFORMATION */}
                  <div className="col-span-full border-b pb-2 mt-6">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Family Information
                    </h3>
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="user_pan_no"
                        name="user_pan_no"
                        type="text"
                        placeholder=""
                        value={formData.user_pan_no}
                        onChange={onInputChange}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.user_pan_no
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="user_pan_no"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        PAN No <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.user_pan_no && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.user_pan_no}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Select
                        value={formData.married}
                        onValueChange={(val) =>
                          handleSelectChange("married", val)
                        }
                        onOpenChange={(open) =>
                          setActiveSelect(open ? "married" : null)
                        }
                      >
                        <SelectTrigger
                          data-field="married"
                          className={`h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none ring-0 focus:ring-0 data-[state=open]:ring-0 ${
                            errors.married
                              ? "border-b-red-500"
                              : "border-b-gray-300"
                          }`}
                        >
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={4}
                          className="border-0 shadow-lg ring-1 ring-slate-100 rounded-xl"
                        >
                          {marriedOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <label
                        className={getLabelClass("married", formData.married)}
                      >
                        Are you married <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.married && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.married}
                      </div>
                    )}
                  </div>

                  {/* Conditional Spouse Fields */}
                  {formData.married === "Yes" && (
                    <>
                      <div className="relative flex flex-col">
                        <div className="relative">
                          <Input
                            id="spouse_name"
                            name="spouse_name"
                            type="text"
                            placeholder=""
                            value={formData.spouse_name}
                            onChange={onInputChange}
                            className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                              errors.spouse_name
                                ? "border-b-red-500"
                                : "border-b-gray-300"
                            }`}
                          />
                          <label
                            htmlFor="spouse_name"
                            className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                          >
                            Spouse Name
                          </label>
                        </div>
                        {errors.spouse_name && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.spouse_name}
                          </div>
                        )}
                      </div>

                      <div className="relative flex flex-col">
                        <div className="relative">
                          <Input
                            id="spouse_mobile"
                            name="spouse_mobile"
                            type="tel"
                            placeholder=""
                            value={formData.spouse_mobile}
                            onChange={onInputChange}
                            maxLength={10}
                            className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                              errors.spouse_mobile
                                ? "border-b-red-500"
                                : "border-b-gray-300"
                            }`}
                          />
                          <label
                            htmlFor="spouse_mobile"
                            className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                          >
                            Spouse Mobile No
                          </label>
                        </div>
                        {errors.spouse_mobile && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.spouse_mobile}
                          </div>
                        )}
                      </div>

                      <div className="relative flex flex-col">
                        <div className="relative">
                          <Input
                            id="spouse_dob"
                            name="spouse_dob"
                            type="date"
                            value={formData.spouse_dob}
                            onChange={onInputChange}
                            max={new Date().toISOString().split("T")[0]}
                            className={`peer h-14 pt-7 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                              errors.spouse_dob
                                ? "border-b-red-500"
                                : "border-b-gray-300"
                            }`}
                          />
                          <label
                            htmlFor="spouse_dob"
                            className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-focus:text-primary"
                          >
                            Spouse DOB
                          </label>
                        </div>
                        {errors.spouse_dob && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.spouse_dob}
                          </div>
                        )}
                      </div>

                      <div className="relative flex flex-col">
                        <div className="relative">
                          <Input
                            id="f_mannidate"
                            name="f_mannidate"
                            type="date"
                            value={formData.f_mannidate}
                            onChange={onInputChange}
                            max={new Date().toISOString().split("T")[0]}
                            className={`peer h-14 pt-7 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                              errors.f_mannidate
                                ? "border-b-red-500"
                                : "border-b-gray-300"
                            }`}
                          />
                          <label
                            htmlFor="f_mannidate"
                            className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-focus:text-primary"
                          >
                            Spouse Anniversary Date
                          </label>
                        </div>
                        {errors.f_mannidate && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.f_mannidate}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="relative flex flex-col col-span-1">
                    <div className="relative">
                      <Input
                        id="father_name"
                        name="father_name"
                        type="text"
                        placeholder=""
                        value={formData.father_name}
                        onChange={onInputChange}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.father_name
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="father_name"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Father Name <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.father_name && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.father_name}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="f_mfdob"
                        name="f_mfdob"
                        type="date"
                        value={formData.f_mfdob}
                        onChange={onInputChange}
                        max={new Date().toISOString().split("T")[0]}
                        className="peer h-14 pt-7 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                      />
                      <label
                        htmlFor="f_mfdob"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-focus:text-primary"
                      >
                        Father Date of Birth
                      </label>
                    </div>
                    {errors.f_mfdob && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.f_mfdob}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="father_mobile"
                        name="father_mobile"
                        type="tel"
                        placeholder=""
                        value={formData.father_mobile}
                        onChange={onInputChange}
                        maxLength={10}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.father_mobile
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="father_mobile"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Father's Mobile No{" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.father_mobile && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.father_mobile}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="native_place"
                        name="native_place"
                        type="text"
                        placeholder=""
                        value={formData.native_place}
                        onChange={onInputChange}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.native_place
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="native_place"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Nativeplace <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.native_place && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.native_place}
                      </div>
                    )}
                  </div>

                  {/* CONTACT */}
                  <div className="col-span-full border-b pb-2 mt-6">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Contact
                    </h3>
                  </div>

                  <div className="relative flex flex-col col-span-full">
                    <div className="relative">
                      <Input
                        id="residential_add"
                        name="residential_add"
                        type="text"
                        placeholder=""
                        value={formData.residential_add}
                        onChange={onInputChange}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent w-full ${
                          errors.residential_add
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="residential_add"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Residential Address{" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.residential_add && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.residential_add}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col col-span-1 md:col-span-2">
                    <div className="relative">
                      <Input
                        id="residential_landmark"
                        name="residential_landmark"
                        type="text"
                        placeholder=""
                        value={formData.residential_landmark}
                        onChange={onInputChange}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.residential_landmark
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="residential_landmark"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Landmark <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.residential_landmark && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.residential_landmark}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="residential_city"
                        name="residential_city"
                        type="text"
                        placeholder=""
                        value={formData.residential_city}
                        onChange={onInputChange}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.residential_city
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="residential_city"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        City <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.residential_city && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.residential_city}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="residential_pin"
                        name="residential_pin"
                        type="text"
                        placeholder=""
                        value={formData.residential_pin}
                        onChange={onInputChange}
                        maxLength={6}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.residential_pin
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="residential_pin"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Pincode <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.residential_pin && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.residential_pin}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col col-span-full">
                    <div className="relative">
                      <Input
                        id="office_add"
                        name="office_add"
                        type="text"
                        placeholder=""
                        value={formData.office_add}
                        onChange={onInputChange}
                        className="peer h-14 pt-10 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent w-full"
                      />
                      <label
                        htmlFor="office_add"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Office Address
                      </label>
                    </div>
                    {errors.office_add && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.office_add}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col col-span-1 md:col-span-2">
                    <div className="relative">
                      <Input
                        id="office_landmark"
                        name="office_landmark"
                        type="text"
                        placeholder=""
                        value={formData.office_landmark}
                        onChange={onInputChange}
                        className="peer h-14 pt-10 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                      />
                      <label
                        htmlFor="office_landmark"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Landmark
                      </label>
                    </div>
                    {errors.office_landmark && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.office_landmark}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="office_city"
                        name="office_city"
                        type="text"
                        placeholder=""
                        value={formData.office_city}
                        onChange={onInputChange}
                        className="peer h-14 pt-10 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                      />
                      <label
                        htmlFor="office_city"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        City
                      </label>
                    </div>
                    {errors.office_city && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.office_city}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="office_pin"
                        name="office_pin"
                        type="text"
                        placeholder=""
                        value={formData.office_pin}
                        onChange={onInputChange}
                        maxLength={6}
                        className="peer h-14 pt-10 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                      />
                      <label
                        htmlFor="office_pin"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Pincode
                      </label>
                    </div>
                    {errors.office_pin && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.office_pin}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="office_phone"
                        name="office_phone"
                        type="text"
                        placeholder=""
                        value={formData.office_phone}
                        onChange={onInputChange}
                        className="peer h-14 pt-10 pl-0 border-0 border-b border-b-gray-300 rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent"
                      />
                      <label
                        htmlFor="office_phone"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Office No
                      </label>
                    </div>
                    {errors.office_phone && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.office_phone}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="whats_app"
                        name="whats_app"
                        type="tel"
                        placeholder=""
                        value={formData.whats_app}
                        onChange={onInputChange}
                        maxLength={10}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.whats_app
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="whats_app"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Whats App <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.whats_app && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.whats_app}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
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
                        <SelectTrigger
                          data-field="mailaddress"
                          className={`h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none ring-0 focus:ring-0 data-[state=open]:ring-0 ${
                            errors.mailaddress
                              ? "border-b-red-500"
                              : "border-b-gray-300"
                          }`}
                        >
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={4}
                          className="border-0 shadow-lg ring-1 ring-slate-100 rounded-xl"
                        >
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
                        Mail Address <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.mailaddress && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.mailaddress}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
                    <div className="relative">
                      <Input
                        id="user_resident_to_bang_since"
                        name="user_resident_to_bang_since"
                        type="text"
                        placeholder=""
                        value={formData.user_resident_to_bang_since}
                        onChange={onInputChange}
                        required
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.user_resident_to_bang_since
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="user_resident_to_bang_since"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Since Resident in Bangalore (Year){" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.user_resident_to_bang_since && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.user_resident_to_bang_since}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
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
                        <SelectTrigger
                          data-field="donate_blood"
                          className={`h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none ring-0 focus:ring-0 data-[state=open]:ring-0 ${
                            errors.donate_blood
                              ? "border-b-red-500"
                              : "border-b-gray-300"
                          }`}
                        >
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={4}
                          className="border-0 shadow-lg ring-1 ring-slate-100 rounded-xl"
                        >
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
                        Donate Blood <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.donate_blood && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.donate_blood}
                      </div>
                    )}
                  </div>

                  {/* INTRODUCTION */}
                  <div className="col-span-full border-b pb-2 mt-6">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                      Introduction
                    </h3>
                  </div>

                  <div className="relative flex flex-col col-span-1 md:col-span-2">
                    <div className="relative">
                      <Input
                        id="f_mintroby"
                        name="f_mintroby"
                        type="text"
                        placeholder=""
                        value={formData.f_mintroby}
                        onChange={onInputChange}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.f_mintroby
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="f_mintroby"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Introducd By (Member Name){" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.f_mintroby && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.f_mintroby}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col col-span-1">
                    <div className="relative">
                      <Input
                        id="f_mmemno"
                        name="f_mmemno"
                        type="text"
                        placeholder=""
                        value={formData.f_mmemno}
                        onChange={onInputChange}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.f_mmemno
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="f_mmemno"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Membership No. of Introducer{" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.f_mmemno && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.f_mmemno}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col col-span-1">
                    <div className="relative">
                      <Input
                        id="f_mintrophone"
                        name="f_mintrophone"
                        type="tel"
                        placeholder=""
                        value={formData.f_mintrophone}
                        onChange={onInputChange}
                        maxLength={10}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all bg-transparent ${
                          errors.f_mintrophone
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="f_mintrophone"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Phone No. of Introducer{" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.f_mintrophone && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.f_mintrophone}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col col-span-1 md:col-span-2">
                    <div className="relative">
                      <Input
                        id="f_mintroadd"
                        name="f_mintroadd"
                        type="text"
                        placeholder=""
                        value={formData.f_mintroadd}
                        onChange={onInputChange}
                        className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                          errors.f_mintroadd
                            ? "border-b-red-500"
                            : "border-b-gray-300"
                        }`}
                      />
                      <label
                        htmlFor="f_mintroadd"
                        className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                      >
                        Address of Introducer{" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.f_mintroadd && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.f_mintroadd}
                      </div>
                    )}
                  </div>

                  <div className="relative flex flex-col">
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
                        <SelectTrigger
                          data-field="f_motherorga"
                          className={`h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent flex justify-between items-center w-full shadow-none ring-0 focus:ring-0 data-[state=open]:ring-0 ${
                            errors.f_motherorga
                              ? "border-b-red-500"
                              : "border-b-gray-300"
                          }`}
                        >
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={4}
                          className="border-0 shadow-lg ring-1 ring-slate-100 rounded-xl"
                        >
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
                        Member of any Other Organizations{" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {errors.f_motherorga && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.f_motherorga}
                      </div>
                    )}
                  </div>

                  {formData.f_motherorga === "Yes" && (
                    <>
                      <div className="relative flex flex-col">
                        <div className="relative">
                          <Input
                            id="org_name"
                            name="org_name"
                            type="text"
                            placeholder=""
                            value={formData.org_name}
                            onChange={onInputChange}
                            className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                              errors.org_name
                                ? "border-b-red-500"
                                : "border-b-gray-300"
                            }`}
                          />
                          <label
                            htmlFor="org_name"
                            className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                          >
                            Organization Name
                          </label>
                        </div>
                        {errors.org_name && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.org_name}
                          </div>
                        )}
                      </div>

                      <div className="relative flex flex-col">
                        <div className="relative">
                          <Input
                            id="org_type"
                            name="org_type"
                            type="text"
                            placeholder=""
                            value={formData.org_type}
                            onChange={onInputChange}
                            className={`peer h-14 pt-10 pl-0 border-0 border-b rounded-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-b-primary transition-all bg-transparent ${
                              errors.org_type
                                ? "border-b-red-500"
                                : "border-b-gray-300"
                            }`}
                          />
                          <label
                            htmlFor="org_type"
                            className="absolute left-0 top-3 text-xs text-slate-500 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary"
                          >
                            Organization Type
                          </label>
                        </div>
                        {errors.org_type && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors.org_type}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* MEMBERSHIP FEES OPTIONS */}
                  <div className="col-span-full border-t pt-6 mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
                    <div className="flex flex-col lg:flex-row gap-4 w-full">
                      <label className="flex items-center justify-between cursor-pointer w-full bg-white p-4 sm:p-5 rounded-2xl border hover:border-rose-400 transition-all shadow-sm">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <input
                            type="radio"
                            name="priceaga"
                            value="5100"
                            checked={formData.priceaga === "5100"}
                            onChange={onInputChange}
                            className="w-5 h-5 min-w-[20px] text-rose-600 border-gray-300 focus:ring-rose-500"
                          />
                          <div>
                            <span className="font-bold text-slate-800 text-sm sm:text-base block mb-0.5">
                              Life Member
                            </span>
                            <span className="text-xs sm:text-sm text-slate-500 block leading-tight">
                              Entry Fee: 100 | Membership: 5,000
                            </span>
                          </div>
                        </div>
                        <span className="font-black text-slate-900 text-sm sm:text-lg ml-2 whitespace-nowrap">
                          ₹ 5,100
                        </span>
                      </label>

                      <label className="flex items-center justify-between cursor-pointer w-full bg-white p-4 sm:p-5 rounded-2xl border hover:border-rose-400 transition-all shadow-sm">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <input
                            type="radio"
                            name="priceaga"
                            value="11100"
                            checked={formData.priceaga === "11100"}
                            onChange={onInputChange}
                            className="w-5 h-5 min-w-[20px] text-rose-600 border-gray-300 focus:ring-rose-500"
                          />
                          <div>
                            <span className="font-bold text-slate-800 text-sm sm:text-base block mb-0.5">
                              Patron Life Member
                            </span>
                            <span className="text-xs sm:text-sm text-slate-500 block leading-tight">
                              Entry Fee: 100 | Membership: 11,000
                            </span>
                          </div>
                        </div>
                        <span className="font-black text-slate-900 text-sm sm:text-lg ml-2 whitespace-nowrap">
                          ₹ 11,100
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
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Submitting...
                      </span>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* OTP Verification Dialog */}
        <Dialog open={otpDialogOpen} onOpenChange={handleDialogOpenChange}>
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
    </>
  );
};

export default Register;
