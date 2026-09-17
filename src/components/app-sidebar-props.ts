export interface Org {
  orgId: string;
  orgName: string;
}

export type OrgChangeCallback = (org: {
  orgId: string;
  orgName: string;
}) => void;

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
}

export interface SideBarItemProps {
  itemId: string;
  title: string;
  url: string;
  icon?: React.ElementType;
}

export interface AppSidebarProps {
  org?: Org;
  activeItem: string;
  onNavigate?: () => void;
}
