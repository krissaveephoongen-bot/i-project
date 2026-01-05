import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface UserFormProps {
    initialData?: {
        id?: number;
        name: string;
        email: string;
        role: string;
    };
    onSave: (data: { name: string; email: string; role: string; password?: string }) => Promise<void>;
    onCancel: () => void;
    isSaving: boolean;
}

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (!password) return { score: 0, label: 'No password', color: 'bg-gray-200' };
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    const strengths: PasswordStrength[] = [
        { score: 1, label: 'Weak', color: 'bg-red-500' },
        { score: 2, label: 'Fair', color: 'bg-orange-500' },
        { score: 3, label: 'Good', color: 'bg-yellow-500' },
        { score: 4, label: 'Strong', color: 'bg-lime-500' },
        { score: 5, label: 'Very Strong', color: 'bg-green-500' }
    ];

    return strengths[Math.min(score, 4)] || { score: 0, label: 'No password', color: 'bg-gray-200' };
};

export function UserForm({ initialData, onSave, onCancel, isSaving }: UserFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        role: initialData?.role || 'user',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isDirty, setIsDirty] = useState(false);

    const passwordStrength = getPasswordStrength(formData.password);

    const validate = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!EMAIL_REGEX.test(formData.email)) newErrors.email = 'Valid email is required';
        if (!initialData && !formData.password) {
            newErrors.password = 'Password is required';
        }
        if (formData.password && formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, initialData]);

    useEffect(() => {
        setIsDirty(
            formData.name !== (initialData?.name || '') ||
            formData.email !== (initialData?.email || '') ||
            formData.role !== (initialData?.role || 'user') ||
            formData.password !== '' ||
            formData.confirmPassword !== ''
        );
    }, [formData, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const { confirmPassword, ...userData } = formData;
        const finalData: { name: string; email: string; role: string; password?: string } = { ...userData };

        if (initialData?.id) {
            if (!finalData.password) {
                delete finalData.password;
            }
        }

        await onSave(finalData);
        setIsDirty(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (!touched[name]) {
            setTouched(prev => ({ ...prev, [name]: true }));
        }
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validate();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className="font-medium">
                    Full Name
                </Label>
                <div className="relative">
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={() => handleBlur('name')}
                        placeholder="John Doe"
                        className={`pr-8 ${errors.name && touched.name
                                ? 'border-red-500 focus:border-red-500'
                                : formData.name && !errors.name
                                    ? 'border-green-500'
                                    : ''
                            }`}
                    />
                    {touched.name && formData.name && !errors.name && (
                        <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    )}
                </div>
                {errors.name && touched.name && (
                    <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                    </div>
                )}
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">
                    Email
                </Label>
                <div className="relative">
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                        placeholder="user@example.com"
                        className={`pr-8 ${errors.email && touched.email
                                ? 'border-red-500 focus:border-red-500'
                                : formData.email && !errors.email
                                    ? 'border-green-500'
                                    : ''
                            }`}
                    />
                    {touched.email && formData.email && !errors.email && (
                        <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    )}
                </div>
                {errors.email && touched.email && (
                    <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                    </div>
                )}
            </div>

            {/* Role */}
            <div className="space-y-2">
                <Label htmlFor="role" className="font-medium">
                    Role
                </Label>
                <Select
                    value={formData.role}
                    onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, role: value }));
                        setTouched(prev => ({ ...prev, role: true }));
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Password Section */}
            {!initialData?.id && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="font-medium">
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={() => handleBlur('password')}
                                placeholder="At least 8 characters"
                                className={`pr-10 ${errors.password && touched.password
                                        ? 'border-red-500 focus:border-red-500'
                                        : formData.password && !errors.password
                                            ? 'border-green-500'
                                            : ''
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">Strength</span>
                                    <span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {errors.password && touched.password && (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="font-medium">
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={() => handleBlur('confirmPassword')}
                                placeholder="Re-enter password"
                                className={`pr-10 ${errors.confirmPassword && touched.confirmPassword
                                        ? 'border-red-500 focus:border-red-500'
                                        : formData.confirmPassword &&
                                            formData.password === formData.confirmPassword &&
                                            !errors.confirmPassword
                                            ? 'border-green-500'
                                            : ''
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && touched.confirmPassword && (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                                <AlertCircle className="h-4 w-4" />
                                {errors.confirmPassword}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="w-24"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSaving || !isDirty}
                    className="w-32"
                >
                    {isSaving ? (
                        <>
                            <span className="inline-block mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                            Saving...
                        </>
                    ) : initialData?.id ? (
                        'Update User'
                    ) : (
                        'Create User'
                    )}
                </Button>
            </div>
        </form>
    );
}
