export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  membership_type: 'Exploratory' | 'Starter' | 'Lovely';
  membership_status: 'Pending' | 'Active' | 'Expired';
  birth_date: string | null;
  phone_number: string | null;
  membership_expiration: string | null;
  last_check_in: string | null;
}

export interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  phoneNumber?: string;
  membershipType?: 'Exploratory' | 'Starter' | 'Lovely';
}