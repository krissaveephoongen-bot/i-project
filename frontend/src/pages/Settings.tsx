import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Shield, Eye, EyeOff, Camera, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { buildApiUrl } from '@/lib/api-config';
import ScrollContainer from '@/components/layout/ScrollContainer';
import ErrorState from '@/components/ErrorState';
import LoadingState from '@/components/LoadingState';
import { parseApiError } from '@/lib/error-handler';

interface UserSettings {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    role: string;
    timezone: string;
    language: string;
    avatar?: string;
}

interface NotificationPrefs {
    emailNotifications: boolean;
    pushNotifications: boolean;
    taskReminders: boolean;
    approvalAlerts: boolean;
    weeklyDigest: boolean;
    notificationFrequency: 'instant' | 'daily' | 'weekly';
}

export default function Settings() {
    const { user: contextUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string>('');

    // Profile form state
    const [profile, setProfile] = useState<UserSettings>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        role: 'member',
        timezone: 'UTC',
        language: 'en',
        avatar: '',
    });

    // Notification preferences
    const [notifications, setNotifications] = useState<NotificationPrefs>({
        emailNotifications: true,
        pushNotifications: false,
        taskReminders: true,
        approvalAlerts: true,
        weeklyDigest: true,
        notificationFrequency: 'daily',
    });

    // Password change
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Load settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);

                if (contextUser) {
                    // Load real user data from context
                    const avatar = contextUser.avatar || '';
                    setProfile({
                        firstName: contextUser.name?.split(' ')[0] || '',
                        lastName: contextUser.name?.split(' ').slice(1).join(' ') || '',
                        email: contextUser.email || '',
                        phone: contextUser.phone || '',
                        department: contextUser.department || '',
                        role: contextUser.role || 'USER',
                        timezone: contextUser.timezone || 'Asia/Bangkok',
                        language: 'en',
                        avatar: avatar,
                    });
                    setAvatarPreview(avatar);
                }
            } catch (error) {
                console.error('Error loading settings:', error);
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [contextUser]);

    // Handle avatar upload
    const handleAvatarUpload = async (file: File) => {
        try {
            setUploading(true);
            const reader = new FileReader();

            reader.onload = async (e) => {
                const base64 = e.target?.result as string;
                setAvatarPreview(base64);
                setProfile({ ...profile, avatar: base64 });
                toast.success('Avatar updated (not saved yet - click Save Changes)');
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error processing avatar:', error);
            toast.error('Failed to process avatar');
        } finally {
            setUploading(false);
        }
    };

    // Handle avatar remove
    const handleRemoveAvatar = () => {
        setAvatarPreview('');
        setProfile({ ...profile, avatar: '' });
        toast.success('Avatar removed (not saved yet - click Save Changes)');
    };

    // Handle profile save
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profile.firstName || !profile.lastName || !profile.email) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);

            // Get token from storage
            const token = localStorage.getItem('accessToken');
            if (!contextUser?.id) {
                throw new Error('User ID not found');
            }

            // Call API to update user profile
            const response = await fetch(buildApiUrl(`/api/users/${contextUser.id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: `${profile.firstName} ${profile.lastName}`,
                    phone: profile.phone,
                    department: profile.department,
                    avatar: profile.avatar,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save profile');
            }

            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    // Handle password change
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast.error('Please fill in all password fields');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (passwordForm.currentPassword === passwordForm.newPassword) {
            toast.error('New password must be different from current password');
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem('accessToken');
            if (!contextUser?.id) {
                throw new Error('User ID not found');
            }

            // Call API to change password
            const response = await fetch(buildApiUrl(`/api/users/${contextUser.id}/change-password`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to change password');
            }

            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            toast.success('Password changed successfully');
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    // Handle notification preferences save
    const handleSaveNotifications = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            const token = localStorage.getItem('accessToken');
            if (!contextUser?.id) {
                throw new Error('User ID not found');
            }

            // Call API to save notification preferences
            const response = await fetch(buildApiUrl(`/api/users/${contextUser.id}/notification-preferences`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(notifications),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save notification preferences');
            }

            toast.success('Notification preferences updated');
        } catch (error) {
            console.error('Error saving notifications:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save notification preferences');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <div className="grid gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <ScrollContainer>
            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your account and application preferences
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-white border-b border-gray-200">
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6 mt-6">
                        {/* Avatar Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Picture</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    {/* Avatar Display */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-32 w-32 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        {avatarPreview ? (
                                        <img
                                        src={avatarPreview}
                                        alt="Avatar Preview"
                                        className="h-full w-full object-cover"
                                        />
                                        ) : (
                                        <div className="text-4xl font-bold text-gray-400">
                                        {contextUser?.email?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        )}
                                        </div>
                                        <p className="text-xs text-gray-500">Max 5MB, JPG/PNG/GIF</p>
                                    </div>

                                    {/* Upload Controls */}
                                    <div className="flex-1 flex flex-col gap-3">
                                        <label className="block">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                                                <Camera className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                    {uploading ? 'Uploading...' : 'Choose Photo'}
                                                </span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            toast.error('File size must be less than 5MB');
                                                            return;
                                                        }
                                                        handleAvatarUpload(file);
                                                    }
                                                }}
                                                disabled={uploading}
                                                className="hidden"
                                            />
                                        </label>

                                        {avatarPreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveAvatar}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="text-sm font-medium">Remove Photo</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Personal Info Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name *
                                            </label>
                                            <Input
                                                value={profile.firstName}
                                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                                placeholder="John"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name *
                                            </label>
                                            <Input
                                                value={profile.lastName}
                                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <Input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="bg-gray-100 cursor-not-allowed"
                                            placeholder="john@example.com"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <Input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Department
                                        </label>
                                        <Input
                                            value={profile.department}
                                            onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                            placeholder="Development"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role
                                        </label>
                                        <Input
                                            value={profile.role}
                                            disabled
                                            className="bg-gray-100 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Role can only be changed by administrator</p>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSaveNotifications} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notification Frequency
                                        </label>
                                        <Select value={notifications.notificationFrequency} onValueChange={(value) => setNotifications({ ...notifications, notificationFrequency: value as any })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="instant">Instant</SelectItem>
                                                <SelectItem value="daily">Daily Digest</SelectItem>
                                                <SelectItem value="weekly">Weekly Digest</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-900">Notification Types</h3>

                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">Email Notifications</p>
                                                <p className="text-sm text-gray-600">Receive updates via email</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifications.emailNotifications}
                                                onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">Push Notifications</p>
                                                <p className="text-sm text-gray-600">Receive browser notifications</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifications.pushNotifications}
                                                onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">Task Reminders</p>
                                                <p className="text-sm text-gray-600">Get reminded about upcoming tasks</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifications.taskReminders}
                                                onChange={(e) => setNotifications({ ...notifications, taskReminders: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">Approval Alerts</p>
                                                <p className="text-sm text-gray-600">Get notified about pending approvals</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifications.approvalAlerts}
                                                onChange={(e) => setNotifications({ ...notifications, approvalAlerts: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">Weekly Digest</p>
                                                <p className="text-sm text-gray-600">Receive a weekly summary</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifications.weeklyDigest}
                                                onChange={(e) => setNotifications({ ...notifications, weeklyDigest: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                            {saving ? 'Saving...' : 'Save Preferences'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password *
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password *
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Minimum 8 characters with uppercase, lowercase, and numbers
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password *
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                            {saving ? 'Updating...' : 'Change Password'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                    </TabsContent>
                </Tabs>
            </div>
        </ScrollContainer>
    );
}
