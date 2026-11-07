import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Avatar } from '@/components/primitives/avatar';
import { Badge, StatusBadge } from '@/components/primitives/badge';
import { Button } from '@/components/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/primitives/card';
import { ConfirmDialog } from '@/components/primitives/confirm-dialog';
import { Drawer } from '@/components/primitives/drawer';
import { Input } from '@/components/primitives/input';
import { Pagination } from '@/components/primitives/pagination';
import { Progress } from '@/components/primitives/progress';
import { Switch } from '@/components/primitives/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/primitives/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { Textarea } from '@/components/primitives/textarea';

describe('shadcn/ui-backed Primitives', () => {
  it('renders Button, Badge, Card, Avatar, and Progress through shadcn/ui data-slot nodes', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Avatar name="Amina Pharmacy" />
          <Badge variant="approved" withDot>
            Approved
          </Badge>
          <StatusBadge status="In Review" />
          <Progress value={64} label="Repayment progress" />
          <Button variant="primary">Submit Application</Button>
        </CardContent>
      </Card>,
    );

    expect(container.querySelector('[data-slot="card"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="avatar"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="badge"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="progress"]')).toHaveAttribute(
      'aria-label',
      'Repayment progress',
    );
    expect(screen.getByRole('button', { name: 'Submit Application' })).toHaveAttribute(
      'data-slot',
      'button',
    );
  });

  it('associates Label and error descriptions on Input and Textarea', () => {
    render(
      <div>
        <Input label="Loan amount" error="Enter a valid loan amount" />
        <Textarea label="Reviewer notes" error="Reviewer notes are required" />
      </div>,
    );

    const input = screen.getByLabelText('Loan amount');
    expect(input).toHaveAttribute('data-slot', 'input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const inputDescribedBy = input.getAttribute('aria-describedby');
    expect(inputDescribedBy).toBeTruthy();
    expect(document.getElementById(inputDescribedBy!)).toHaveTextContent(
      'Enter a valid loan amount',
    );

    const textarea = screen.getByLabelText('Reviewer notes');
    expect(textarea).toHaveAttribute('data-slot', 'textarea');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders Pagination, Switch, Tabs, and Table using shadcn/ui slots', () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <div>
        <Switch aria-label="Enable notifications" defaultChecked />
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
          <TabsContent value="active">Active loans table</TabsContent>
          <TabsContent value="closed">Closed loans table</TabsContent>
        </Tabs>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Loan ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>BH-LN-101</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Pagination
          currentPage={1}
          totalPages={3}
          totalCount={15}
          startIndex={1}
          endIndex={5}
          onPageChange={onPageChange}
        />
      </div>,
    );

    expect(container.querySelector('[data-slot="switch"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="tabs"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="table"]')).not.toBeNull();

    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav).toHaveAttribute('data-slot', 'pagination');
    expect(nav).not.toHaveAttribute('role');

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('mounts Drawer via shadcn/ui Sheet and ConfirmDialog via shadcn/ui Dialog', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <>
        <Drawer isOpen onClose={onClose} title="Activity Log">
          <p>Recent events</p>
        </Drawer>
        <ConfirmDialog
          open
          onOpenChange={() => {}}
          title="Approve Application"
          description="Confirm approval for this credit application."
          onConfirm={onConfirm}
        />
      </>,
    );

    expect(document.querySelector('[data-slot="sheet-content"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeNull();
  });
});
