import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminUsersApi, type ManagedRole, type ManagedUser } from "@/api/adminUsersApi";
import { SPECIALTIES } from "@/lib/mock-data";
import { DashboardShell } from "@/components/dashboard/shell";
import { Avatar, adminPersona } from "@/components/dashboard/common";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { adminNav } from "@/lib/nav";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management — MediAI Care" },
      { name: "description", content: "Create, update and remove patient and doctor accounts." },
      { property: "og:title", content: "User Management — MediAI Care" },
      { property: "og:description", content: "Manage patient and doctor accounts." },
    ],
  }),
  component: UsersPage,
});

interface UserForm {
  name: string;
  email: string;
  password: string;
  doctorId: string;
  profilePhoto: string | null;
  age: number | "";
  gender: "Female" | "Male" | "Other";
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  specialization: string;
  qualifications: string;
  yearsOfExperience: number;
  medicalLicenseNumber: string;
  department: string;
  consultationFee: number;
  bio: string;
}

type EditingUser = {
  mode: "add" | "edit";
  role: ManagedRole;
  userId?: string;
  data: UserForm;
} | null;

const DEPARTMENTS = [
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Neurology",
  "Obstetrics & Gynecology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
];

const blankUser = (): UserForm => ({
  name: "",
  email: "",
  password: "",
  doctorId: "",
  profilePhoto: null,
  age: "",
  gender: "Female",
  dateOfBirth: "",
  phoneNumber: "",
  address: "",
  specialization: SPECIALTIES[0],
  qualifications: "",
  yearsOfExperience: 0,
  medicalLicenseNumber: "",
  department: DEPARTMENTS[0],
  consultationFee: 0,
  bio: "",
});

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected image"));
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read the selected image"));
    };
    reader.readAsDataURL(file);
  });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [activeRole, setActiveRole] = useState<ManagedRole>("patient");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EditingUser>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setUsers(await adminUsersApi.list());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load users";
      setLoadError(message);
      toast.error("Could not load users", { description: message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const roleUsers = useMemo(
    () => users.filter((user) => user.role === activeRole),
    [users, activeRole],
  );
  const filteredUsers = roleUsers.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const setForm = (patch: Partial<UserForm>) => {
    setEditing((current) =>
      current ? { ...current, data: { ...current.data, ...patch } } : current,
    );
  };

  const saveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || pending) return;
    const name = editing.data.name.trim();
    const email = editing.data.email.trim();
    const password = editing.data.password;

    if (name.length < 2 || !email) {
      toast.error("Enter a name and email address");
      return;
    }
    if (editing.mode === "add" && password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (editing.mode === "edit" && password && password.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (
      editing.role === "doctor" &&
      (!editing.data.dateOfBirth ||
        !editing.data.phoneNumber.trim() ||
        !editing.data.address.trim() ||
        !editing.data.specialization ||
        !editing.data.qualifications.trim() ||
        !editing.data.medicalLicenseNumber.trim() ||
        !editing.data.department ||
        !editing.data.bio.trim())
    ) {
      toast.error("Complete all required doctor profile fields");
      return;
    }
    if (
      editing.role === "patient" &&
      (editing.data.age === "" ||
        editing.data.age < 0 ||
        editing.data.age > 120 ||
        !Number.isInteger(editing.data.age))
    ) {
      toast.error("Enter a valid patient age between 0 and 120");
      return;
    }

    setPending(true);
    try {
      const baseInput = {
        name,
        email,
        ...(password ? { password } : {}),
      };
      const doctorInput =
        editing.role === "doctor"
          ? {
              profilePhoto: editing.data.profilePhoto,
              gender: editing.data.gender,
              dateOfBirth: editing.data.dateOfBirth,
              phoneNumber: editing.data.phoneNumber.trim(),
              address: editing.data.address.trim(),
              specialization: editing.data.specialization,
              qualifications: editing.data.qualifications.trim(),
              yearsOfExperience: editing.data.yearsOfExperience,
              medicalLicenseNumber: editing.data.medicalLicenseNumber.trim(),
              department: editing.data.department,
              consultationFee: editing.data.consultationFee,
              bio: editing.data.bio.trim(),
            }
          : {};
      const patientInput =
        editing.role === "patient"
          ? {
              age: Number(editing.data.age),
              gender: editing.data.gender,
              profilePhoto: editing.data.profilePhoto,
            }
          : {};
      if (editing.mode === "add") {
        const { user } = await adminUsersApi.create({
          ...baseInput,
          ...doctorInput,
          ...patientInput,
          role: editing.role,
        });
        setUsers((current) => [user, ...current]);
        toast.success(`${editing.role === "patient" ? "Patient" : "Doctor"} account created`, {
          description: `${user.name} can now sign in`,
        });
      } else {
        const { user } = await adminUsersApi.update(editing.userId!, {
          ...baseInput,
          ...doctorInput,
          ...patientInput,
        });
        setUsers((current) => current.map((item) => (item.id === user.id ? user : item)));
        toast.success("User updated", { description: user.name });
      }
      setEditing(null);
    } catch (error) {
      toast.error("Could not save user", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setPending(false);
    }
  };

  const removeUser = async (user: ManagedUser) => {
    if (pending) return;
    setPending(true);
    try {
      await adminUsersApi.remove(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      toast.success(`${user.role === "patient" ? "Patient" : "Doctor"} removed`);
    } catch (error) {
      toast.error("Could not remove user", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setPending(false);
    }
  };

  const startAdd = (role: ManagedRole) => {
    setEditing({ mode: "add", role, data: blankUser() });
  };

  const startEdit = (user: ManagedUser) => {
    setEditing({
      mode: "edit",
      role: user.role,
      userId: user.id,
      data: {
        ...blankUser(),
        name: user.name,
        email: user.email,
        doctorId: user.doctorId ?? "",
        profilePhoto: user.profilePhoto ?? null,
        age: user.age ?? "",
        gender: user.gender ?? "Female",
        dateOfBirth: user.dateOfBirth ?? "",
        phoneNumber: user.phoneNumber ?? "",
        address: user.address ?? "",
        specialization: user.specialization ?? SPECIALTIES[0],
        qualifications: user.qualifications ?? "",
        yearsOfExperience: user.yearsOfExperience ?? 0,
        medicalLicenseNumber: user.medicalLicenseNumber ?? "",
        department: user.department ?? DEPARTMENTS[0],
        consultationFee: user.consultationFee ?? 0,
        bio: user.bio ?? "",
        password: "",
      },
    });
  };

  return (
    <DashboardShell
      title="User management"
      subtitle={`${users.filter((user) => user.role === "patient").length} patients · ${users.filter((user) => user.role === "doctor").length} doctors`}
      nav={adminNav}
      role="Admin"
      persona={adminPersona}
    >
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users"
          className="rounded-xl pl-9"
        />
      </div>

      <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as ManagedRole)}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="patient">Patients</TabsTrigger>
          <TabsTrigger value="doctor">Doctors</TabsTrigger>
        </TabsList>
        {(["patient", "doctor"] as const).map((role) => (
          <TabsContent key={role} value={role}>
            <div className="mb-3 flex justify-end">
              <Button className="rounded-xl" onClick={() => startAdd(role)}>
                <Plus className="mr-1 h-4 w-4" />
                Add {role}
              </Button>
            </div>
            <GlassCard className="overflow-x-auto">
              {loading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">Loading users…</p>
              ) : loadError ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-destructive">{loadError}</p>
                  <Button variant="outline" className="mt-3" onClick={() => void loadUsers()}>
                    Try again
                  </Button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="py-2">Name</th>
                      <th>Email</th>
                      {role === "doctor" && <th>Doctor ID</th>}
                      {role === "patient" && (
                        <>
                          <th>Age</th>
                          <th>Gender</th>
                        </>
                      )}
                      <th>Created</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-t border-border/50">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            {role === "doctor" && user.profilePhoto ? (
                              <img
                                src={user.profilePhoto}
                                alt={`${user.name} profile`}
                                className="h-[30px] w-[30px] rounded-full object-cover"
                              />
                            ) : role === "patient" && user.profilePhoto ? (
                              <img
                                src={user.profilePhoto}
                                alt={`${user.name} profile`}
                                className="h-[30px] w-[30px] rounded-full object-cover"
                              />
                            ) : (
                              <Avatar
                                name={user.name}
                                hue={(user.id.length * 37) % 360}
                                size={30}
                              />
                            )}
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        {role === "doctor" && <td>{user.doctorId ?? "—"}</td>}
                        {role === "patient" && (
                          <>
                            <td>{user.age ?? "—"}</td>
                            <td>{user.gender ?? "—"}</td>
                          </>
                        )}
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="whitespace-nowrap text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Edit ${user.name}`}
                            disabled={pending}
                            onClick={() => startEdit(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Remove ${user.name}`}
                            disabled={pending}
                            onClick={() => void removeUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={role === "doctor" ? 5 : 6}
                          className="py-10 text-center text-muted-foreground"
                        >
                          {query ? "No users match your search." : `No ${role}s yet.`}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </GlassCard>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(open) => !open && !pending && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.mode === "add"
                ? `Add ${editing.role}`
                : `Edit ${editing?.role ?? "user"} account`}
            </DialogTitle>
            <DialogDescription>
              {editing?.mode === "add"
                ? "Set the sign-in credentials for this account."
                : "Leave the new password blank to keep the current one."}
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <form id="managed-user-form" onSubmit={saveUser} className="space-y-5">
              {editing.role === "doctor" && (
                <>
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">Personal information</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Full name">
                        <Input
                          autoComplete="name"
                          required
                          minLength={2}
                          maxLength={80}
                          value={editing.data.name}
                          onChange={(event) => setForm({ name: event.target.value })}
                        />
                      </Field>
                      <Field label="Profile photo (PNG, JPEG or WebP; max 3 MB)">
                        <Input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
                              toast.error("Choose a PNG, JPEG or WebP image");
                              event.target.value = "";
                              return;
                            }
                            if (file.size > 3 * 1024 * 1024) {
                              toast.error("Profile photo must be 3 MB or smaller");
                              event.target.value = "";
                              return;
                            }
                            try {
                              setForm({ profilePhoto: await fileToDataUrl(file) });
                            } catch (error) {
                              toast.error(
                                error instanceof Error ? error.message : "Could not read image",
                              );
                            }
                          }}
                        />
                        {editing.data.profilePhoto && (
                          <div className="mt-2 flex items-center gap-3">
                            <img
                              src={editing.data.profilePhoto}
                              alt="Selected doctor profile"
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setForm({ profilePhoto: null })}
                            >
                              Remove photo
                            </Button>
                          </div>
                        )}
                      </Field>
                      <Field label="Gender">
                        <Select
                          value={editing.data.gender}
                          onValueChange={(value) =>
                            setForm({ gender: value as UserForm["gender"] })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Date of birth">
                        <Input
                          type="date"
                          required
                          value={editing.data.dateOfBirth}
                          onChange={(event) => setForm({ dateOfBirth: event.target.value })}
                        />
                      </Field>
                      <Field label="Phone number">
                        <Input
                          type="tel"
                          autoComplete="tel"
                          required
                          value={editing.data.phoneNumber}
                          onChange={(event) => setForm({ phoneNumber: event.target.value })}
                        />
                      </Field>
                      <Field label="Email address">
                        <Input
                          type="email"
                          autoComplete="email"
                          required
                          value={editing.data.email}
                          onChange={(event) => setForm({ email: event.target.value })}
                        />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Address">
                          <Textarea
                            required
                            value={editing.data.address}
                            onChange={(event) => setForm({ address: event.target.value })}
                          />
                        </Field>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">Professional information</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Doctor ID">
                        <Input
                          value={editing.data.doctorId || "Generated automatically after creation"}
                          readOnly
                        />
                      </Field>
                      <Field label="Specialization">
                        <Select
                          value={editing.data.specialization}
                          onValueChange={(specialization) => setForm({ specialization })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SPECIALTIES.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Qualifications">
                        <Input
                          required
                          value={editing.data.qualifications}
                          onChange={(event) => setForm({ qualifications: event.target.value })}
                        />
                      </Field>
                      <Field label="Years of experience">
                        <Input
                          type="number"
                          min={0}
                          max={80}
                          required
                          value={editing.data.yearsOfExperience}
                          onChange={(event) =>
                            setForm({ yearsOfExperience: Number(event.target.value) })
                          }
                        />
                      </Field>
                      <Field label="Medical license number">
                        <Input
                          required
                          value={editing.data.medicalLicenseNumber}
                          onChange={(event) =>
                            setForm({ medicalLicenseNumber: event.target.value })
                          }
                        />
                      </Field>
                      <Field label="Department">
                        <Select
                          value={editing.data.department}
                          onValueChange={(department) => setForm({ department })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DEPARTMENTS.map((department) => (
                              <SelectItem key={department} value={department}>
                                {department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Consultation fee">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          required
                          value={editing.data.consultationFee}
                          onChange={(event) =>
                            setForm({ consultationFee: Number(event.target.value) })
                          }
                        />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Bio / About doctor">
                          <Textarea
                            required
                            value={editing.data.bio}
                            onChange={(event) => setForm({ bio: event.target.value })}
                          />
                        </Field>
                      </div>
                    </div>
                  </section>
                </>
              )}
              {editing.role === "patient" && (
                <>
                  <Field label="Full name">
                    <Input
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={80}
                      value={editing.data.name}
                      onChange={(event) => setForm({ name: event.target.value })}
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      autoComplete="email"
                      required
                      value={editing.data.email}
                      onChange={(event) => setForm({ email: event.target.value })}
                    />
                  </Field>
                  <Field label="Age">
                    <Input
                      type="number"
                      min={0}
                      max={120}
                      step={1}
                      required
                      value={editing.data.age}
                      onChange={(event) =>
                        setForm({
                          age: event.target.value === "" ? "" : Number(event.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Gender">
                    <Select
                      value={editing.data.gender}
                      onValueChange={(value) =>
                        setForm({ gender: value as UserForm["gender"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Patient image (PNG, JPEG or WebP; max 3 MB)">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
                          toast.error("Choose a PNG, JPEG or WebP image");
                          event.target.value = "";
                          return;
                        }
                        if (file.size > 3 * 1024 * 1024) {
                          toast.error("Patient image must be 3 MB or smaller");
                          event.target.value = "";
                          return;
                        }
                        try {
                          setForm({ profilePhoto: await fileToDataUrl(file) });
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Could not read image",
                          );
                        }
                      }}
                    />
                    {editing.data.profilePhoto && (
                      <div className="mt-2 flex items-center gap-3">
                        <img
                          src={editing.data.profilePhoto}
                          alt="Selected patient image"
                          className="h-14 w-14 rounded-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setForm({ profilePhoto: null })}
                        >
                          Remove image
                        </Button>
                      </div>
                    )}
                  </Field>
                </>
              )}
              <Field
                label={editing.mode === "add" ? "Initial password" : "New password (optional)"}
              >
                <Input
                  type="password"
                  autoComplete="new-password"
                  required={editing.mode === "add"}
                  minLength={8}
                  maxLength={128}
                  value={editing.data.password}
                  onChange={(event) => setForm({ password: event.target.value })}
                />
              </Field>
            </form>
          )}
          <DialogFooter>
            <Button variant="outline" disabled={pending} onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="managed-user-form" disabled={pending}>
              {pending ? "Saving…" : editing?.mode === "add" ? "Create account" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
