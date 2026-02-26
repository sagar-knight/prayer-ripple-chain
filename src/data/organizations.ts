export type FamilyType = "Church" | "Ministry" | "Nonprofit" | "Community Group" | "Other";
export type OrgType = FamilyType; // backward compat alias
export type OrgStatus = "active" | "pending";
export type FamilyMemberRole = "admin" | "moderator" | "member";
export type OrgMemberRole = FamilyMemberRole;
export type FamilyMemberStatus = "active" | "pending";
export type OrgMemberStatus = FamilyMemberStatus;

export interface Family {
  id: string;
  name: string;
  type: OrgType;
  countryCode: string;
  countryName: string;
  city?: string;
  website?: string;
  contactEmail: string;
  description: string;
  logoUrl?: string;
  status: OrgStatus;
  inviteCode: string;
  memberCount: number;
  prayerCount: number;
  requestCount: number;
}

export type Organization = Family; // backward compat alias

export interface FamilyMembership {
  id: string;
  familyId: string;
  userId: string;
  role: FamilyMemberRole;
  status: FamilyMemberStatus;
  joinedAt: string;
}
export type OrgMembership = FamilyMembership;

export interface FamilyPrayerRequest {
  id: string;
  familyId: string;
  createdByUserId: string;
  createdByName: string;
  title: string;
  description: string;
  category: string;
  visibility: "public" | "anonymous";
  showCountry: boolean;
  shareToGlobal: boolean;
  status: "open" | "answered";
  prayerCountFamily: number;
  prayerCountGlobal: number;
  createdAt: string;
}
export type OrgPrayerRequest = FamilyPrayerRequest;

export const familyTypes: FamilyType[] = ["Church", "Ministry", "Nonprofit", "Community Group", "Other"];
export const orgTypes = familyTypes; // backward compat alias

export const sampleFamilies: Family[] = [
  {
    id: "org-1",
    name: "Grace Community Church",
    type: "Church",
    countryCode: "US",
    countryName: "United States",
    city: "Nashville, TN",
    website: "https://gracecommunity.example.com",
    contactEmail: "prayer@gracecommunity.example.com",
    description: "A vibrant church family committed to prayer, worship, and serving our community with the love of Christ.",
    status: "active",
    inviteCode: "GRACE2026",
    memberCount: 145,
    prayerCount: 1240,
    requestCount: 89,
  },
  {
    id: "org-2",
    name: "Hope for Nations Ministry",
    type: "Ministry",
    countryCode: "GB",
    countryName: "United Kingdom",
    city: "London",
    website: "https://hopefornations.example.org",
    contactEmail: "info@hopefornations.example.org",
    description: "An international prayer ministry connecting believers across borders to pray for the nations.",
    status: "active",
    inviteCode: "HOPE4NAT",
    memberCount: 312,
    prayerCount: 4530,
    requestCount: 267,
  },
  {
    id: "org-3",
    name: "Sunrise Prayer Fellowship",
    type: "Community Group",
    countryCode: "NG",
    countryName: "Nigeria",
    city: "Lagos",
    contactEmail: "sunrise@example.com",
    description: "An early-morning prayer fellowship dedicated to interceding for families and communities in West Africa.",
    status: "active",
    inviteCode: "SUNRISE1",
    memberCount: 78,
    prayerCount: 920,
    requestCount: 54,
  },
  {
    id: "org-4",
    name: "Redeemer Baptist Church",
    type: "Church",
    countryCode: "CA",
    countryName: "Canada",
    city: "Toronto",
    contactEmail: "prayer@redeemer.example.ca",
    description: "A prayerful Baptist congregation in the heart of Toronto, focused on revival and discipleship.",
    status: "active",
    inviteCode: "REDEEM26",
    memberCount: 92,
    prayerCount: 680,
    requestCount: 41,
  },
  {
    id: "org-5",
    name: "Hands of Mercy Nonprofit",
    type: "Nonprofit",
    countryCode: "PH",
    countryName: "Philippines",
    city: "Manila",
    website: "https://handsofmercy.example.ph",
    contactEmail: "prayer@handsofmercy.example.ph",
    description: "A nonprofit serving vulnerable communities through prayer, disaster relief, and spiritual support.",
    status: "active",
    inviteCode: "MERCY26",
    memberCount: 56,
    prayerCount: 410,
    requestCount: 33,
  },
  {
    id: "org-6",
    name: "Lighthouse Youth Ministry",
    type: "Ministry",
    countryCode: "AU",
    countryName: "Australia",
    city: "Sydney",
    contactEmail: "youth@lighthouse.example.au",
    description: "Empowering young believers through prayer, mentorship, and Bible-centered community.",
    status: "active",
    inviteCode: "LIGHT26",
    memberCount: 134,
    prayerCount: 1890,
    requestCount: 112,
  },
];

export const sampleOrganizations = sampleFamilies; // backward compat alias

export const sampleFamilyRequests: FamilyPrayerRequest[] = [
  {
    id: "oreq-1",
    familyId: "org-1",
    createdByUserId: "u1",
    createdByName: "Sarah M.",
    title: "Healing for Pastor James",
    description: "Our pastor is recovering from surgery. Please pray for complete healing and strength.",
    category: "Health",
    visibility: "public",
    showCountry: true,
    shareToGlobal: false,
    status: "open",
    prayerCountFamily: 18,
    prayerCountGlobal: 0,
    createdAt: "2026-02-14",
  },
  {
    id: "oreq-2",
    familyId: "org-1",
    createdByUserId: "u2",
    createdByName: "Anonymous",
    title: "Family Restoration",
    description: "Praying for reconciliation in a family going through a difficult season.",
    category: "Family",
    visibility: "anonymous",
    showCountry: false,
    shareToGlobal: true,
    status: "open",
    prayerCountFamily: 12,
    prayerCountGlobal: 9,
    createdAt: "2026-02-13",
  },
  {
    id: "oreq-3",
    familyId: "org-1",
    createdByUserId: "u3",
    createdByName: "David K.",
    title: "Mission Trip Provision",
    description: "Our youth group needs $5,000 for summer mission trip to Guatemala. Pray for provision and open doors.",
    category: "Faith",
    visibility: "public",
    showCountry: true,
    shareToGlobal: true,
    status: "open",
    prayerCountFamily: 24,
    prayerCountGlobal: 15,
    createdAt: "2026-02-10",
  },
];
export const sampleOrgRequests = sampleFamilyRequests; // backward compat alias
