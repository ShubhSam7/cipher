"use client";

import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Globe, Lock, Users } from "lucide-react";
import type { CommunityDTO } from "@/lib/validation/communities";

export default function PostDestinationPicker({ communities, value, onChange, disabled, loading }: {
  communities: CommunityDTO[];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  loading: boolean;
}) {
  const selected = communities.find(community => community.id === value);
  const label = selected ? `c/${selected.name}` : "Campus feed";
  const description = selected?.isPublic === false ? "Only community members can see this" : "Visible to campus members";
  const Icon = selected ? selected.isPublic ? Users : Lock : Globe;

  return <div className="space-y-2">
    <p id="post-destination-label" className="text-sm font-medium">Post to</p>
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger id="post-community" aria-labelledby="post-destination-label post-destination-value" disabled={disabled || !communities.length} className="destination-trigger">
        <span className="icon-tile shrink-0"><Icon size={18} aria-hidden /></span>
        <span className="min-w-0 flex-1 text-left"><span id="post-destination-value" title={label} className="block truncate font-semibold">{loading ? "Loading communities…" : label}</span><span title={description} className="metadata block truncate">{description}</span></span>
        {communities.length > 0 && <ChevronDown size={18} className="shrink-0 text-muted-foreground" aria-hidden />}
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content align="start" sideOffset={6} collisionPadding={16} className="destination-menu" style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}>
          <Dropdown.RadioGroup aria-label="Post destination" value={value} onValueChange={onChange}>
            {[{ id: "", name: "Campus feed", detail: "Visible to campus members", Icon: Globe }, ...communities.map(community => ({ id: community.id, name: `c/${community.name}`, detail: community.isPublic ? "Campus-visible community" : "Members-only community", Icon: community.isPublic ? Users : Lock }))].map(option => <Dropdown.RadioItem key={option.id} value={option.id} className="destination-option">
              <option.Icon size={18} className="shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1"><span className="block break-words font-medium">{option.name}</span><span className="metadata block">{option.detail}</span></span>
              <span className="flex w-5 shrink-0 justify-center"><Dropdown.ItemIndicator><Check size={18} aria-hidden /></Dropdown.ItemIndicator></span>
            </Dropdown.RadioItem>)}
          </Dropdown.RadioGroup>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
    {!loading && !disabled && !communities.length && <p className="metadata">Join a community to post there. You can post to the campus feed now.</p>}
  </div>;
}
