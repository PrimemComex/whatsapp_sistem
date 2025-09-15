// ====================================
// 🔘 BUTTON WRAPPER - Compatibilidade
// Wrapper para usar os botões existentes do projeto
// ====================================

import React from 'react';
import { 
  PrimaryButton, 
  SecondaryButton, 
  DangerButton, 
  SuccessButton,
  WarningButton,
  GhostButton 
} from './Button';

const ButtonWrapper = ({ 
  variant = 'primary', 
  size = 'medium',
  loading = false,
  disabled = false,
  children, 
  ...props 
}) => {
  // Mapear variants para componentes existentes
  const ButtonComponent = {
    primary: PrimaryButton,
    secondary: SecondaryButton,
    danger: DangerButton,
    success: SuccessButton,
    warning: WarningButton,
    outline: GhostButton,
    ghost: GhostButton
  }[variant] || PrimaryButton;

  // Converter props para formato compatível
  const buttonProps = {
    ...props,
    disabled: disabled || loading
  };

  return (
    <ButtonComponent {...buttonProps}>
      {loading && '⏳ '}
      {children}
    </ButtonComponent>
  );
};

export default ButtonWrapper;
export { ButtonWrapper as Button };