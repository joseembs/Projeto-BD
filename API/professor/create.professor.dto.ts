import { IsString, IsEmail, IsDate, IsNumber, IsOptional, IsNotEmpty } from "class-validator";

export class CreateProfessorDTO {
  @IsString()
  @IsNotEmpty()
  Matricula: string;

  @IsString()
  @IsNotEmpty()
  CPF: string;

  @IsString()
  @IsNotEmpty()
  Nome: string;

  @IsEmail()
  @IsNotEmpty()
  Email: string;

  @IsDate()
  @IsOptional()
  DataNascimento?: Date;

  @IsNumber()
  @IsOptional()
  Idade?: number;

  @IsString()
  @IsNotEmpty()
  Status: string;

  @IsNumber()
  @IsOptional()
  Salario?: number;
}