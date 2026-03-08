'use client'

import { useState } from 'react'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteBudgetItem } from '@/actions/budget'
import { useToast } from '@/components/ui/use-toast'


interface BudgetListProps {
    items: any[]
    eventId: string
}

export function BudgetList({ items, eventId }: BudgetListProps) {
    const { toast } = useToast()

    // Group items? No, standard table is easier to scan.

    async function onDelete(id: string) {
        if (!confirm('Are you sure you want to delete this expense?')) return

        const result = await deleteBudgetItem(id, eventId)
        if (result.error) {
            toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive',
            })
        } else {
            toast({
                title: 'Deleted',
                description: 'Expense removed.',
            })
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Estimated</TableHead>
                        <TableHead className="text-right">Actual</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No expenses added yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {item.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {item.description}
                                    {item.notes && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.notes}</p>}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(item.estimated_amount)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.actual_amount > 0 ? formatCurrency(item.actual_amount) : '-'}
                                </TableCell>
                                <TableCell className="text-right text-green-600">
                                    {item.paid_amount > 0 ? formatCurrency(item.paid_amount) : '-'}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                        onClick={() => onDelete(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>

                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
