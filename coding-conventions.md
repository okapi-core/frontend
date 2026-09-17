# Modular frontend components

## principle of principality (you are responsible for your territory)

Inner components should not make assumptions about their outer containers
Container components are responsible for spacing and layering
aka not "mt" or "mb" only inner padding.

# Principle of locality

All inner components in one file
All shared components in @components/ui or @components/shared
