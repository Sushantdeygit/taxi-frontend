"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Spinner } from "@/components/Loaders/Spinner";
import { registerUser } from "../../features/Users/userSlice"; // Replace with the actual import path
import { PRODUCT_NAME } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const { loading, error, status } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    fullName: {
      firstName: "",
      lastName: "",
    },
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "firstName" || name === "lastName") {
      setFormData((prevData) => ({
        ...prevData,
        fullName: {
          ...prevData.fullName,
          [name]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.fullName.firstName.length < 3) {
      newErrors.firstName = "First name must be at least 3 characters.";
    }
    if (formData.fullName.lastName.length < 3) {
      newErrors.lastName = "Last name must be at least 3 characters.";
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(registerUser(formData));
      if (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error,
          duration: 3000,
        });
      }
      if (status === "succeeded") {
        router.push("/login");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="p-7">
        <h1 className="font-bold text-white text-4xl">{PRODUCT_NAME}</h1>
      </div>
      <div className="p-7">
        <Card className="mt-10 mx-auto max-w-lg bg-black text-white">
          <CardHeader>
            <CardTitle>Sign Up as User</CardTitle>
            <CardDescription>
              Create a new account to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-white"
                  >
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.fullName.firstName}
                    onChange={handleChange}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-white"
                  >
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.fullName.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
                <p className="text-sm text-white mt-1">
                  Password must be at least 6 characters long.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Spinner /> : "Sign Up"}
              </Button>
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </form>
            <p className="mt-4 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600">
                Sign In Here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
