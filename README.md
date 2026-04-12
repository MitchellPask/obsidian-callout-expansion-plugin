# Obsidian Callout Expansion Plugin
A few additional features added for markdown callouts.

## Features
- Multi-column support (nesting included)
- Custom callout options
- Settings menu for column padding and min-width
- Highlighting and box-shadows on hover (for all callouts)

## Future Plans
- Remove background color mixing
    - Currently nested callouts have their backgrounds muddied, which gets quite ugly if you need to nest more than one layer deep

## Installation
1. Clone or download this repository
2. Move the `Callout Expansion` plugin folder to your vault's plugins directory (`~/your-obsidian-vault/.obsidian/.plugins/`)
3. Enable the `Callout Expansion` plugin
    - Settings > Community Plugins > Turn off Safe Mode > Enable `Callout Expansion` plugin

## Syntax Example
**(no-nesting)**
```markdown
 > [!col]
 > > [!combat]+ **Combat**
 > > asdfasdf
 > > asdfasdf
 >
 > > [!dice-roll]+ **Roll**
 > > asdfasfd
 > > asdfasdf
 >
 > > [!treasure]+ **Treasure**
 > > asdfasfd
 > > asdfasdf
```

**(nesting)**
```markdown
> [!abstract]+ top level
> content
> content
> > [!col]
> > > [!success]+ nested
> > > nested content
> > > nested content
> >
> > > [!failure]+ nested
> > > nested content
> > > nested content
> >
> > > [!warning]+ nested
> > > nested content
> > > nested content
```

## License
[MIT License](LICENSE.md)