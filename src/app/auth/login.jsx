import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WEB_API } from "@/constants/apiConstants";
import apiClient from "@/api/apiClient";
import { setCredentials } from "@/store/auth/authSlice";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Login = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const usernameRef = useRef(null);

  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  const onInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") {
      if (/^\d*$/.test(value)) {
        setUser((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const onCheckMobile = async (e) => {
    e.preventDefault();
    if (!user.username) {
      toast.error("Please enter mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post(WEB_API.checkMobileNo, {
        username: user.username,
      });

      if (res.data.code == "400") { 
        toast.error("Mobile No is not Registered");
      } else {
        toast.success("OTP Sent to Mobile No.");
        setShowOtpField(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!user.password) {
      toast.error("Please enter OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post(WEB_API.login, {
        username: user.username,
        password: user.password,
      });

      if (res.status == 200) {
        const userInfo = res.data.UserInfo;
        if (userInfo && userInfo.token) {
          // Update Redux
          dispatch(
            setCredentials({
              token: userInfo.token,
              user: userInfo.user,
              user_type_id: userInfo.user.user_type_id,
            }),
          );
          // Update localStorage as per src copy
          localStorage.setItem("token", userInfo.token);
          localStorage.setItem("agrawal_image", userInfo.user.agrawal_image);
          localStorage.setItem("name", userInfo.user.name);
          localStorage.setItem("user_type_id", userInfo.user.user_type_id);

          toast.success("Login Successful");
          navigate("/home");
        } else {
          toast.error(res.data.msg || "Invalid OTP");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const carouselImages = [
    "https://agrawalsamaj.co/assets/web_assets/image/top_slider/slider3.jpg",
    "https://agrawalsamaj.co/assets/web_assets/image/top_slider/slider2.jpg",
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left side - Carousel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 border-r">
        <Carousel
          className="w-full h-full"
          plugins={[Autoplay({ delay: 5000 })]}
          opts={{ loop: true }}
        >
          <CarouselContent className="h-screen m-0 p-0">
            {carouselImages.map((src, index) => (
              <CarouselItem key={index} className="h-full w-full p-0">
                <img
                  src={src}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover opacity-80"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-0 flex flex-col justify-end p-12 bg-gradient-to-t from-black/60 to-transparent">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Agarwal Samaj
          </h1>
          <p className="text-slate-200">
            Connect with your community and stay updated with the latest events
            and news.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col justify-center items-start gap-5">
            <img
              src="https://new.agrawalsamaj.co/assets/logo-LrjSJo0H.png"
              alt="Logo"
              className="h-auto w-[80%]"
            />
            <div className="space-y-2 px-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Login
              </h2>
              <p className="text-slate-500">
                If you are already a member, easily log in with your mobile
                number.
              </p>
            </div>
          </div>

          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Authentication</CardTitle>
              <CardDescription>
                {showOtpField
                  ? "Enter the OTP sent to your mobile"
                  : "Enter your registered mobile number"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showOtpField ? (
                <form onSubmit={onCheckMobile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Mobile Number</Label>
                    <Input
                      id="username"
                      name="username"
                      type="tel"
                      placeholder="Enter mobile number"
                      value={user.username}
                      onChange={onInputChange}
                      ref={usernameRef}
                      maxLength={10}
                      className="h-12 border-slate-200 focus:ring-slate-900"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white"
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">OTP</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter OTP"
                      value={user.password}
                      onChange={onInputChange}
                      className="h-12 border-slate-200 focus:ring-slate-900 text-center text-lg tracking-widest font-bold"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Login"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full hover:bg-slate-100"
                    onClick={() => setShowOtpField(false)}
                  >
                    Change Mobile Number
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
