export type AuthUser = {
  userId?: string;
  name?: string;
  email: string;
  role?: string;
  teamId?: string;
};

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  fullName: string;
  email: string;
  password: string;
  invitation?: string;
};

export type VerifyAccountPayload = {
  email: string;
  code: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  id: string;
  newPassword: string;
};
