import { supabase } from '@/lib/supabase';
import { useCallback, useState } from 'react';
import { useToast } from '../ui/useToast';

export interface TipOperation {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
}

export function useTipOperations() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createTip = useCallback(async (tip: Omit<TipOperation, 'id'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tips')
        .insert(tip)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tip created successfully',
        type: 'success',
      });

      return data;
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create tip',
        type: 'error',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateTip = useCallback(async (id: string, updates: Partial<TipOperation>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tips')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tip updated successfully',
        type: 'success',
      });

      return data;
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update tip',
        type: 'error',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteTip = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tips')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tip deleted successfully',
        type: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete tip',
        type: 'error',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    createTip,
    updateTip,
    deleteTip,
    loading,
  };
}