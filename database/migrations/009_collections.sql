-- Migration: 009_collections
-- Description: Create user collections and collection items tables for organizing content

-- Create user_collections table
CREATE TABLE IF NOT EXISTS public.user_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create collection_items table
CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID REFERENCES public.user_collections(id) ON DELETE CASCADE NOT NULL,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('shower', 'tip', 'exercise', 'note', 'link')),
    item_id UUID NOT NULL,
    notes TEXT,
    tags TEXT[],
    position INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT false,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, item_type, item_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_collections_user_id ON public.user_collections(user_id);
CREATE INDEX idx_user_collections_is_public ON public.user_collections(is_public);
CREATE INDEX idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX idx_collection_items_item_type ON public.collection_items(item_type);
CREATE INDEX idx_collection_items_item_id ON public.collection_items(item_id);
CREATE INDEX idx_collection_items_is_favorite ON public.collection_items(is_favorite);

-- Enable RLS
ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_collections
CREATE POLICY "Users can view their own collections" ON public.user_collections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public collections" ON public.user_collections
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own collections" ON public.user_collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON public.user_collections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON public.user_collections
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for collection_items
CREATE POLICY "Users can view items in their collections" ON public.collection_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_collections
            WHERE id = collection_items.collection_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view items in public collections" ON public.collection_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_collections
            WHERE id = collection_items.collection_id
            AND is_public = true
        )
    );

CREATE POLICY "Users can add items to their collections" ON public.collection_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_collections
            WHERE id = collection_items.collection_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update items in their collections" ON public.collection_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_collections
            WHERE id = collection_items.collection_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items from their collections" ON public.collection_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_collections
            WHERE id = collection_items.collection_id
            AND user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_collections_updated_at BEFORE UPDATE ON public.user_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_items_updated_at BEFORE UPDATE ON public.collection_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default collections for new users (function)
CREATE OR REPLACE FUNCTION create_default_collections()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_collections (user_id, name, description, icon, color, is_default, sort_order)
    VALUES 
        (NEW.id, 'Favorites', 'Your favorite items', '⭐', '#FFD700', true, 0),
        (NEW.id, 'My Journey', 'Track your cold shower journey', '🚿', '#00BFFF', true, 1),
        (NEW.id, 'Inspiration', 'Motivational content', '💪', '#FF6347', true, 2);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add default collections for new users
CREATE TRIGGER create_default_collections_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_default_collections();