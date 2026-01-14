/**
 * Model frontendowy (camelCase).
 * Backend zwraca snake_case, ale interceptor mapuje do camelCase.
 *
 * Serializer: TalentSerializer -> fields: id, name, description
 */
export interface Talent {
  id: number;
  name: string;
  description?: string | null;
}

export interface CreateTalentPayload {
  name: string;
  description?: string | null;
}
