import * as React from 'react';
import { WorkspaceShell } from '@/components/layout/workspace-shell';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
