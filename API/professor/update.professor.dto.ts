import { IsString, IsEmail, IsDate, IsNumber, IsOptional } from "class-validator";

export class UpdateProfessorDTO {
  @IsString()
  @IsOptional()
  CPF?: string;

  @IsString()
  @IsOptional()
  Nome?: string;

  @IsEmail()
  @IsOptional()
  Email?: string;

  @IsDate()
  @IsOptional()
  DataNascimento?: Date;

  @IsNumber()
  @IsOptional()
  Idade?: number;

  @IsString()
  @IsOptional()
  Status?: string;

  @IsNumber()
  @IsOptional()
  Salario?: number;
}