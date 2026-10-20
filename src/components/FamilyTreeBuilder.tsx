/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, X, User, Check, Star } from "lucide-react";
import { FamilyMember } from "../types/questionnaire.ts";
import { ImageUploader } from "./ImageUploader.tsx";
import { VoiceTextarea } from "./VoiceTextarea.tsx";

interface FamilyTreeBuilderProps {
  partner1: string;
  partner2: string;
  members: FamilyMember[];
  onMembersChange: (members: FamilyMember[]) => void;
  treePhotoUrl?: string;
  onTreePhotoChange: (url?: string) => void;
  treeNotes: string;
  onTreeNotesChange: (notes: string) => void;
}

const RELATIONSHIP_OPTIONS = [
  "Mother",
  "Father",
  "Sibling",
  "Grandparent",
  "Uncle or Aunt",
  "Cousin",
  "Close friend",
  "Other",
];

export const FamilyTreeBuilder: React.FC<FamilyTreeBuilderProps> = ({
  partner1,
  partner2,
  members,
  onMembersChange,
  treePhotoUrl,
  onTreePhotoChange,
  treeNotes,
  onTreeNotesChange,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"people" | "photo" | "notes">("people");

  // Form state for new person
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState("Mother");
  const [newSide, setNewSide] = useState<"sideA" | "sideB" | "both">("sideA");
  const [newMustCapture, setNewMustCapture] = useState(false);
  const [newPersonPhotos, setNewPersonPhotos] = useState<string[]>([]);

  const handleSavePerson = () => {
    if (!newName.trim()) return;

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newName.trim(),
      relationship: newRelationship,
      side: newSide,
      mustCapture: newMustCapture,
      photoUrl: newPersonPhotos[0] || undefined,
    };

    onMembersChange([...members, newMember]);
    // Reset form
    setNewName("");
    setNewRelationship("Mother");
    setNewSide("sideA");
    setNewMustCapture(false);
    setNewPersonPhotos([]);
    setIsAdding(false);
  };

  const handleRemoveMember = (id: string) => {
    onMembersChange(members.filter((m) => m.id !== id));
  };

  const sideAName = partner1 || "Partner 1";
  const sideBName = partner2 || "Partner 2";

  const sideAMembers = members.filter((m) => m.side === "sideA");
  const sideBMembers = members.filter((m) => m.side === "sideB");
  const bothMembers = members.filter((m) => m.side === "both");

  return (
    <div className="w-full space-y-6">
      {/* 3 Clear Ways Tabs / Modes */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab("people")}
          className={`py-3 px-2 rounded-xl text-sm font-medium transition-all text-center min-h-[48px] ${
            activeTab === "people"
              ? "bg-white text-[#1A1A1A] shadow-xs font-semibold"
              : "text-[#5F5F5F] hover:text-[#1A1A1A]"
          }`}
        >
          VIP List ({members.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("photo")}
          className={`py-3 px-2 rounded-xl text-sm font-medium transition-all text-center min-h-[48px] ${
            activeTab === "photo"
              ? "bg-white text-[#1A1A1A] shadow-xs font-semibold"
              : "text-[#5F5F5F] hover:text-[#1A1A1A]"
          }`}
        >
          {treePhotoUrl ? "Tree Photo (1)" : "Upload Tree"}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={`py-3 px-2 rounded-xl text-sm font-medium transition-all text-center min-h-[48px] ${
            activeTab === "notes"
              ? "bg-white text-[#1A1A1A] shadow-xs font-semibold"
              : "text-[#5F5F5F] hover:text-[#1A1A1A]"
          }`}
        >
          {treeNotes ? "Written Tree (Saved)" : "Write it out"}
        </button>
      </div>

      {/* TAB 1: ADD A PERSON */}
      {activeTab === "people" && (
        <div className="space-y-6">
          {!isAdding ? (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full min-h-[58px] p-4 rounded-2xl border-2 border-dashed border-[#B08D57]/60 hover:border-[#B08D57] bg-[#FAFAFA]/50 hover:bg-[#FAFAFA] flex items-center justify-center gap-2.5 text-base sm:text-lg font-medium text-[#1A1A1A] transition-all"
            >
              <Plus className="w-5 h-5 text-[#B08D57]" />
              <span>+ Add a person</span>
            </button>
          ) : (
            /* Add Person Inline Card */
            <div className="bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E8]">
                <h3 className="font-semibold text-lg text-[#1A1A1A]">
                  Add Important Person
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-1 rounded-lg text-[#5F5F5F] hover:text-[#1A1A1A]"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#5F5F5F] mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Grandma Rose, Ananya, Uncle David"
                  className="w-full px-4 py-3 text-[18px] bg-white border border-[#E8E8E8] rounded-xl focus:outline-hidden focus:border-[#1A1A1A]"
                  autoFocus
                />
              </div>

              {/* Relationship Chips */}
              <div>
                <label className="block text-sm font-medium text-[#5F5F5F] mb-2">
                  Relationship
                </label>
                <div className="flex flex-wrap gap-2">
                  {RELATIONSHIP_OPTIONS.map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setNewRelationship(rel)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        newRelationship === rel
                          ? "bg-[#1A1A1A] text-white"
                          : "bg-white text-[#1A1A1A] border border-[#E8E8E8] hover:border-[#1A1A1A]/40"
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Which Side Chips */}
              <div>
                <label className="block text-sm font-medium text-[#5F5F5F] mb-2">
                  Which side?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewSide("sideA")}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      newSide === "sideA"
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-white text-[#1A1A1A] border border-[#E8E8E8]"
                    }`}
                  >
                    {sideAName}'s side
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSide("sideB")}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      newSide === "sideB"
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-white text-[#1A1A1A] border border-[#E8E8E8]"
                    }`}
                  >
                    {sideBName}'s side
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSide("both")}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      newSide === "both"
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-white text-[#1A1A1A] border border-[#E8E8E8]"
                    }`}
                  >
                    Both / Mutual
                  </button>
                </div>
              </div>

              {/* Must Capture Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-white border border-[#E8E8E8] rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Star className="w-5 h-5 text-[#B08D57] fill-[#B08D57]/30" />
                  <span className="text-base font-medium text-[#1A1A1A]">
                    Must capture, no matter what
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newMustCapture}
                  onChange={(e) => setNewMustCapture(e.target.checked)}
                  className="w-5 h-5 accent-[#1A1A1A] rounded cursor-pointer"
                />
              </div>

              {/* Optional Photo */}
              <div>
                <ImageUploader
                  images={newPersonPhotos}
                  onChange={setNewPersonPhotos}
                  maxImages={1}
                  label="Optional reference photo (helps us recognise them in the crowd)"
                  buttonLabel="Add a photo of this person"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#E8E8E8] bg-white text-[#5F5F5F] font-medium hover:bg-[#FAFAFA]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newName.trim()}
                  onClick={handleSavePerson}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#1A1A1A] text-white font-medium hover:bg-[#333333] disabled:opacity-40"
                >
                  Save Person
                </button>
              </div>
            </div>
          )}

          {/* Grouped Lists of Added People */}
          {members.length > 0 ? (
            <div className="space-y-4">
              {/* Partner 1's Side */}
              {sideAMembers.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#5F5F5F] mb-2 px-1">
                    {sideAName}'s Side ({sideAMembers.length})
                  </h4>
                  <div className="space-y-2">
                    {sideAMembers.map((m) => (
                      <PersonCard
                        key={m.id}
                        member={m}
                        onRemove={() => handleRemoveMember(m.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Partner 2's Side */}
              {sideBMembers.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#5F5F5F] mb-2 px-1">
                    {sideBName}'s Side ({sideBMembers.length})
                  </h4>
                  <div className="space-y-2">
                    {sideBMembers.map((m) => (
                      <PersonCard
                        key={m.id}
                        member={m}
                        onRemove={() => handleRemoveMember(m.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Both Sides */}
              {bothMembers.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#5F5F5F] mb-2 px-1">
                    Both Sides / Mutual ({bothMembers.length})
                  </h4>
                  <div className="space-y-2">
                    {bothMembers.map((m) => (
                      <PersonCard
                        key={m.id}
                        member={m}
                        onRemove={() => handleRemoveMember(m.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            !isAdding && (
              <p className="text-sm text-center text-[#5F5F5F] py-2">
                No VIPs added yet. You can add people one by one, upload a tree
                drawing, or write it out below.
              </p>
            )
          )}
        </div>
      )}

      {/* TAB 2: UPLOAD A PHOTO OF FAMILY TREE */}
      {activeTab === "photo" && (
        <div className="space-y-4 p-5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl">
          <p className="text-sm text-[#5F5F5F]">
            Have a sketch, an invitation card family chart, or a diagram of your
            family tree? Snap a photo or upload it here.
          </p>
          <ImageUploader
            images={treePhotoUrl ? [treePhotoUrl] : []}
            onChange={(imgs) => onTreePhotoChange(imgs[0] || undefined)}
            maxImages={1}
            buttonLabel="Upload photo of family tree"
          />
        </div>
      )}

      {/* TAB 3: WRITE IT OUT */}
      {activeTab === "notes" && (
        <div className="space-y-4 p-5 bg-[#FAFAFA] border border-[#E8E8E8] rounded-2xl">
          <p className="text-sm text-[#5F5F5F]">
            Feel free to write out key family members, nicknames, or notes about
            who is who.
          </p>
          <VoiceTextarea
            value={treeNotes}
            onChange={onTreeNotesChange}
            placeholder="e.g. My maternal grandmother is in a wheelchair and should be seated front row; Rohit is the brother who flies in from London..."
            rows={5}
            isVoiceEnabled={true}
          />
        </div>
      )}
    </div>
  );
};

interface PersonCardProps {
  member: FamilyMember;
  onRemove: () => void;
}

const PersonCard: React.FC<PersonCardProps> = ({ member, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-3.5 bg-white border border-[#E8E8E8] rounded-xl shadow-2xs">
      <div className="flex items-center gap-3">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={member.name}
            className="w-10 h-10 object-cover rounded-full border border-[#E8E8E8]"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#E8E8E8] flex items-center justify-center text-[#5F5F5F]">
            <User className="w-5 h-5" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#1A1A1A]">{member.name}</span>
            {member.mustCapture && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#B08D57] bg-[#B08D57]/10 px-2 py-0.5 rounded-md">
                <Star className="w-3 h-3 fill-[#B08D57]" />
                Must Capture
              </span>
            )}
          </div>
          <span className="text-xs text-[#5F5F5F]">{member.relationship}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-[#5F5F5F] hover:text-[#1A1A1A] rounded-lg hover:bg-[#FAFAFA]"
        aria-label={`Remove ${member.name}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
