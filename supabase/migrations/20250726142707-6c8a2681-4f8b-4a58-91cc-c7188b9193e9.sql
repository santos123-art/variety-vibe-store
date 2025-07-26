-- Modificar a tabela admins para ser mais flexível
ALTER TABLE public.admins ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Inserir o email admin
INSERT INTO public.admins (email) 
VALUES ('tomvboaz@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Criar uma função para promover usuário a admin automaticamente
CREATE OR REPLACE FUNCTION public.promote_user_to_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Se o email estiver na tabela admins, definir role como admin
  IF EXISTS (SELECT 1 FROM public.admins WHERE email = NEW.email) THEN
    NEW.role = 'admin';
  END IF;
  RETURN NEW;
END;
$function$;

-- Criar trigger para promover automaticamente usuários admin
CREATE TRIGGER promote_admin_users
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.promote_user_to_admin();