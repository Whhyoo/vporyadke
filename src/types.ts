export interface User {
  id: number;
  login: string;
  password_hash: string;
  role: 'admin' | 'mol' | 'employee';
  full_name: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Classroom {
  id: number;
  number: string;
  name: string;
  floor: number;
  responsible_person_id: number; // reference to User.id
}

export interface Equipment {
  id: number;
  inventory_number: string;
  name: string;
  category_id: number; // reference to Category.id
  classroom_id: number; // reference to Classroom.id
  status: 'В эксплуатации' | 'В ремонте' | 'Списано' | 'На складе';
  cost: number;
  purchase_date: string; // YYYY-MM-DD
  assigned_to_user_id: number; // reference to User.id (Teacher/Employee)
}

export interface Movement {
  id: number;
  equipment_id: number; // reference to Equipment.id
  from_classroom_id: number; // reference to Classroom.id
  to_classroom_id: number; // reference to Classroom.id
  movement_date: string; // YYYY-MM-DD HH:MM:SS
  description: string;
  authorized_by_user_id: number; // reference to User.id (MOL)
}
