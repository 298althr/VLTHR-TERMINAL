'use client';

import React from 'react';
import styled from '@emotion/styled';

interface AppleToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleContainer = styled.div<{ checked: boolean }>`
  --primary: #54a8fc;
  --light: #d9d9d9;
  --dark: #121212;
  --gray: #414344;
  --gap: 5px;
  --width: 44px; /* Scaled down slightly for better fit */
  
  position: relative;
  z-index: 10;
  width: fit-content;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ToggleLabel = styled.label<{ checked: boolean }>`
  cursor: pointer;
  position: relative;
  display: inline-block;
  padding: 4px;
  width: 76px;
  height: 32px;
  background-color: ${props => props.checked ? 'rgba(65, 67, 68, 0)' : 'var(--dark)'};
  border: 1px solid ${props => props.checked ? '#3d6970' : '#777777'};
  border-radius: 9999px;
  transition: all 0.3s ease-in-out;
  box-sizing: border-box;

  /* Outer Glow Container (The ::before in original CSS) */
  &::before {
    content: "";
    position: absolute;
    z-index: -10;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: calc(100% + 12px);
    height: calc(100% + 12px);
    background-color: var(--gray);
    border: 1px solid #777777;
    border-radius: 9999px;
    transition: all 0.3s ease-in-out;
    opacity: 0.4;
    ${props => props.checked && `
      box-shadow: 0 0.5rem 1.5rem -1rem #0080ff;
    `}
  }

  /* Inner Gradient (The ::after in original CSS) */
  &::after {
    content: "";
    position: absolute;
    z-index: -5;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(
      circle at 50% -100%,
      rgb(58, 155, 252) 0%,
      rgba(12, 12, 12, 1) 80%
    );
    border-radius: 9999px;
    opacity: ${props => props.checked ? 1 : 0};
    transition: opacity 0.3s ease-in-out;
  }
`;

const ThumbIcon = styled.div<{ checked: boolean }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  background-image: ${props => props.checked 
    ? 'radial-gradient(circle at 50% 0%, #045ab1 0%, var(--primary) 100%)'
    : 'radial-gradient(circle at 50% 0%, #666666 0%, var(--gray) 100%)'};

  border: 1px solid ${props => props.checked ? 'var(--primary)' : '#aaaaaa'};
  border-radius: 9999px;
  box-shadow: ${props => props.checked 
    ? 'inset 0 -0.1rem 0.1rem var(--primary)' 
    : 'inset 0 -0.1rem 0.1rem rgba(255,255,255,0.2)'};

  transition: all 0.3s ease-in-out;
  transform: ${props => props.checked 
    ? 'translateX(44px) rotate(-225deg)' 
    : 'translateX(0) rotate(0deg)'};
  
  &::before {
    content: "✦";
    color: ${props => props.checked ? '#fff' : '#d9d9d9'};
    font-size: 12px;
    text-shadow: ${props => props.checked ? '0 0 8px rgba(255,255,255,0.8)' : 'none'};
  }
`;

export function AppleToggle({ checked, onChange }: AppleToggleProps) {
  return (
    <ToggleContainer checked={checked}>
      <HiddenInput 
        type="checkbox" 
        id="apple-toggle" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
      />
      <ToggleLabel htmlFor="apple-toggle" checked={checked}>
        <ThumbIcon checked={checked} />
      </ToggleLabel>
    </ToggleContainer>
  );
}
