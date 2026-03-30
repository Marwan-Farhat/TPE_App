import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { systemOptionsService, Tag } from "@/services/clientService";
import { useToast } from "@/hooks/use-toast";

interface TagsSelectorProps {
  tags: Tag[];
  selectedTagIds: string[];
  onTagChange: (tagId: string) => void;
  onTagsUpdated: () => void;
}

const TAG_COLORS = [
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#3b82f6", // blue
  "#64748b", // slate
];

const TagsSelector = ({ tags, selectedTagIds, onTagChange, onTagsUpdated }: TagsSelectorProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Please enter a tag name",
        variant: "destructive",
      });
      return;
    }

    // Check if tag name already exists
    const exists = tags.some((t) => t.name.toLowerCase() === newTagName.trim().toLowerCase());
    if (exists) {
      toast({
        title: "Tag already exists",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const newTag = await systemOptionsService.addCustomTag(newTagName.trim(), newTagColor);
      toast({
        title: "Tag created successfully!",
      });
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0]);
      setIsAddDialogOpen(false);
      onTagsUpdated();
      // Auto-select the new tag
      onTagChange(newTag.id);
    } catch (error) {
      toast({
        title: "Error creating tag",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            {selectedTagIds.length > 0 ? (
              <span className="text-muted-foreground">{selectedTagIds.length} tag(s) selected</span>
            ) : (
              <span className="text-muted-foreground">Select tags</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2 bg-popover border border-border z-50" align="start">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded"
                onClick={() => onTagChange(tag.id)}
              >
                <Checkbox checked={selectedTagIds.includes(tag.id)} />
                <Badge style={{ backgroundColor: tag.color }} className="text-white">
                  {tag.name}
                </Badge>
              </div>
            ))}
          </div>

          <div className="border-t border-border mt-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-primary"
              onClick={() => {
                setIsOpen(false);
                setIsAddDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add new tag
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Tags Display */}
      {selectedTagIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTagIds.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            return tag ? (
              <Badge key={tagId} style={{ backgroundColor: tag.color }} className="text-white gap-1">
                {tag.name}
                <button type="button" onClick={() => onTagChange(tagId)} className="ml-1 hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Add New Tag Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Tag</DialogTitle>
            <DialogDescription>Create a new tag that will be permanently available for all clients.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input
                id="tagName"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
              />
            </div>

            <div className="space-y-2">
              <Label>Tag Color</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-transform ${
                      newTagColor === color ? "scale-110 ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            {newTagName && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <Badge style={{ backgroundColor: newTagColor }} className="text-white">
                  {newTagName}
                </Badge>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewTag} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TagsSelector;
