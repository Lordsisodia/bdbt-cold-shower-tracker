import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  created_at: string;
  updated_at: string;
}

export function useClientData(clientId?: string) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    const fetchClient = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (error) throw error;
        setClient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch client');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  return { client, loading, error };
}