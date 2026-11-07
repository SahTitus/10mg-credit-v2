import * as React from 'react';
import { WorkspaceShell } from '@/components/layout/workspace-shell';

export default function LenderLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
