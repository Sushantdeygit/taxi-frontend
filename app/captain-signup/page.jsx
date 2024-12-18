"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { registerCaptain } from "../../features/Captain/captainSlice";
import { Spinner } from "@/components/Loaders/Spinner";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PRODUCT_NAME } from "@/constants";

export default function MultiStepSignUpForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const { status, error } = useSelector((state) => state.captain);

  const loading = status === "loading";
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: {
      firstName: "",
      lastName: "",
    },
    email: "",
    password: "",
    profilePicture: null,
    vehicle: {
      color: "",
      capacity: "",
      licensePlate: "",
      vehicleImage: null,
      vehicleType: "",
    },
  });
  const [errors, setErrors] = useState({});

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      vehicle: {
        ...prevData.vehicle,
        [name]: value,
      },
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    setFormData((prevData) => {
      // Check for nested fields
      if (name === "firstName" || name === "lastName") {
        return {
          ...prevData,
          fullName: {
            ...prevData.fullName,
            [name]: value,
          },
        };
      } else if (
        name === "color" ||
        name === "capacity" ||
        name === "licensePlate" ||
        name === "vehicleImage" ||
        name === "vehicleType"
      ) {
        return {
          ...prevData,
          vehicle: {
            ...prevData.vehicle,
            [name]: type === "file" ? files[0] : value,
          },
        };
      }

      // Handle top-level fields
      return {
        ...prevData,
        [name]: type === "file" ? files[0] : value,
      };
    });

    // Reset specific field errors
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    const { firstName, lastName } = formData.fullName;
    if (firstName.length < 3) {
      newErrors.firstName = "First name should be at least 3 characters";
    }
    if (lastName.length < 3) {
      newErrors.lastName = "Last name should be at least 3 characters";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    if (!formData.profilePicture) {
      newErrors.profilePicture = "Profile picture is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const { color, capacity, licensePlate, vehicleImage, vehicleType } =
      formData.vehicle;
    if (color.length < 3) {
      newErrors.color = "Color must be at least 3 characters long";
    }
    if (!capacity || capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    }
    if (licensePlate.length < 3) {
      newErrors.licensePlate =
        "License Plate number must be at least 3 characters long";
    }
    if (!vehicleType) {
      newErrors.vehicleType = "Vehicle Type is required";
    }
    if (!vehicleImage) {
      newErrors.vehicleImage = "Vehicle image is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (step === 1) {
      handleNextStep();
      return;
    }

    if (step === 2 && validateStep2()) {
      const data = new FormData();

      // Add email and password
      data.append("email", formData.email);
      data.append("password", formData.password);

      // Add fullName as an object (without stringifying)
      data.append("fullName[firstName]", formData.fullName.firstName);
      data.append("fullName[lastName]", formData.fullName.lastName);

      // Add vehicle as an object (without stringifying)
      data.append("vehicle[color]", formData.vehicle.color);
      data.append("vehicle[capacity]", formData.vehicle.capacity);
      data.append("vehicle[licensePlate]", formData.vehicle.licensePlate);
      data.append("vehicle[vehicleType]", formData.vehicle.vehicleType);

      // Add profilePicture file
      if (formData.profilePicture) {
        data.append("profilePicture", formData.profilePicture);
      }

      // Add vehicleImage file
      if (formData.vehicle.vehicleImage) {
        data.append("vehicleImage", formData.vehicle.vehicleImage);
      }

      // Dispatch the action with FormData
      dispatch(registerCaptain(data));
      console.log(status, error);
      if (error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error,
          duration: 3000,
        });
      }

      if (status === "succeeded") {
        router.push("/captain-login");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="p-7">
        <h1 className="font-bold text-white text-4xl">{PRODUCT_NAME}</h1>
      </div>
      <div className="p-7">
        <Card className="mx-auto max-w-[600px] bg-black text-white">
          <CardHeader>
            <CardTitle>Sign Up as Captain - Step {step}</CardTitle>
            <CardDescription>
              Create a new account to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.fullName.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                        aria-invalid={errors.firstName ? "true" : "false"}
                        aria-describedby={
                          errors.firstName ? "firstName-error" : undefined
                        }
                      />
                      {errors.firstName && (
                        <p
                          id="firstName-error"
                          className="text-sm text-red-600"
                        >
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.fullName.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                        aria-invalid={errors.lastName ? "true" : "false"}
                        aria-describedby={
                          errors.lastName ? "lastName-error" : undefined
                        }
                      />
                      {errors.lastName && (
                        <p id="lastName-error" className="text-sm text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      aria-invalid={errors.email ? "true" : "false"}
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="********"
                      required
                      aria-invalid={errors.password ? "true" : "false"}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                    />
                    {errors.password && (
                      <p id="password-error" className="text-sm text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profilePicture">Profile Picture</Label>
                    <Input
                      id="profilePicture"
                      name="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      required
                      aria-invalid={errors.profilePicture ? "true" : "false"}
                      aria-describedby={
                        errors.profilePicture
                          ? "profilePicture-error"
                          : undefined
                      }
                    />
                    {errors.profilePicture && (
                      <p
                        id="profilePicture-error"
                        className="text-sm text-red-600"
                      >
                        {errors.profilePicture}
                      </p>
                    )}
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="color">Vehicle Color</Label>
                    <Input
                      id="color"
                      name="color"
                      value={formData.vehicle.color}
                      onChange={handleChange}
                      placeholder="e.g., Red"
                      required
                      aria-invalid={errors.color ? "true" : "false"}
                      aria-describedby={
                        errors.color ? "color-error" : undefined
                      }
                    />
                    {errors.color && (
                      <p id="color-error" className="text-sm text-red-600">
                        {errors.color}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Vehicle Capacity</Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      value={formData.vehicle.capacity}
                      onChange={handleChange}
                      placeholder="e.g., 4"
                      required
                      min="1"
                      aria-invalid={errors.capacity ? "true" : "false"}
                      aria-describedby={
                        errors.capacity ? "capacity-error" : undefined
                      }
                    />
                    {errors.capacity && (
                      <p id="capacity-error" className="text-sm text-red-600">
                        {errors.capacity}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licensePlate">License Plate</Label>
                    <Input
                      id="licensePlate"
                      name="licensePlate"
                      value={formData.vehicle.licensePlate}
                      onChange={handleChange}
                      placeholder="e.g., ABC123"
                      required
                      aria-invalid={errors.licensePlate ? "true" : "false"}
                      aria-describedby={
                        errors.licensePlate ? "licensePlate-error" : undefined
                      }
                    />
                    {errors.licensePlate && (
                      <p
                        id="licensePlate-error"
                        className="text-sm text-red-600"
                      >
                        {errors.licensePlate}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Select
                      name="Vehicle Type"
                      value={formData.vehicle.vehicleType}
                      onValueChange={(value) =>
                        handleSelectChange("vehicleType", value)
                      }
                    >
                      <SelectTrigger id="vehicleType">
                        <SelectValue
                          className="text-black"
                          placeholder="Select vehicle type"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.vehicleType && (
                      <p
                        id="vehicleType-error"
                        className="text-sm text-red-600"
                      >
                        {errors.vehicleType}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleImage">Vehicle Image</Label>
                    <Input
                      id="vehicleImage"
                      name="vehicleImage"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      required
                      aria-invalid={errors.vehicleImage ? "true" : "false"}
                      aria-describedby={
                        errors.vehicleImage ? "vehicleImage-error" : undefined
                      }
                    />
                    {errors.vehicleImage && (
                      <p
                        id="vehicleImage-error"
                        className="text-sm text-red-600"
                      >
                        {errors.vehicleImage}
                      </p>
                    )}
                  </div>
                </>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            {step === 2 && (
              <Button
                className="text-black"
                onClick={handlePrevStep}
                variant="outline"
              >
                Previous
              </Button>
            )}
            <Button disabled={loading} onClick={handleSubmit}>
              {step === 1 ? "Next" : loading ? <Spinner /> : "Submit"}
            </Button>
          </CardFooter>
          <p className="my-4 text-center">
            Already have an account?{" "}
            <Link href="/captain-login" className="text-blue-600">
              Sign In Here
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
