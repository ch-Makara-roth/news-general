"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { Article } from "@/lib/types";

interface MoreLikeThisButtonProps {
  article: Article;
  onFindRelated: (article: Article) => void;
}

export function MoreLikeThisButton({ article, onFindRelated }: MoreLikeThisButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onFindRelated(article)}
      className="flex items-center gap-2 text-primary hover:text-primary/90 hover:bg-primary/10"
    >
      <Sparkles className="h-4 w-4" /> More like this
    </Button>
  );
}
