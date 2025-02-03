# Change Log

All notable changes to the "JAMRenumbering" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Initial release

### 0.0.1

Initial release.

### 0.0.2

New empty table objects generation command.

### 0.0.3

Remove "extends" and extended object from name in csv

### 0.0.4

Repository visibility issue: Thanks dannoe!!

### 0.0.5

Issue with tablerelation. When found "TableRelation = "Item Variant".Code WHERE("Item No." = FIELD("Item No.")"
creates new field this way:
FIELD("Item No."){}

### 0.0.6

Avoid generate empty tableextension file if no fields added.

### 0.0.7

Generate empty table objects in CAL format. Beta feature, still Testing.

### 0.0.8

Generate empty table objects in CAL format. working.

### 0.0.9

Generate empty table objects in CAL format. All the objects in a single txt file, instead multiple files.

### 0.1.0

Insert extension fields in an old C/SIDE txt table object with command "JAM Insert extension fields into old CSIDE table definition text file"

### 0.1.1

Issue with object declaration search. Previously, we asume the first line was the object declaration, but now we search for the object declaration in the whole file.

### 0.1.2

Add new command "JAM Fix Txt2AL" to fix the txt2al conversion more common issues: lack of application Area, and remove Scope internal deprecate statements.

### 0.1.3

Add new command "JAM Fix Implicit REC in page fields" to fix the implicit REC in page fields, adding the explicit REC in page fields.

### 0.1.4

Exclude implicit REC in page fields in Fix Txt2AL command.

### 0.1.5

Remove command "JAM Fix Implicit REC in page fields" and command "JAM Fix Txt2AL". You can get these commands in the "JAM Variable name extension" extension.

### 0.1.6

Execute removing of commands announce in the previous version.

### 0.1.7

Fixed error in the command "JAM Insert extension fields into old CSIDE table definition text file". Write twice the extension fields in the old txt file in some conditions.

### 0.1.8

Use image free common from https://icons.iconarchive.com/icons/icons8/ios7/512/Programming-Variable-icon.png

### 0.1.9

Use the image free common from https://publicdomainvectors.org/en/free-clipart/Thumb-up-with-animal-numbers/80824.html

### 0.2.0

Error taking the object declaration from the first line. It is now the first line with the object declaration.

### 0.2.1

Fixing some erratic behavior in renumeration related to asynchronous execution. Showing execution log in the output channel.

### 0.2.2

New feature to renumber fields from tableextensions.

### 0.2.3

Fix on new feature to renumber fields from tableextensions. Only apply renumbering in first field of the extension it cathchs and leave the rest of the fields as is.

### 0.2.4

Avoid renumbering error due asynchronous execution.

### 0.2.5

Issue when the object declaration is not the first line. Leave two declation lines in the object.

### 0.2.6

Extend the name of the command to "JAM Create Initial Renumbering CSV ready for fill new ids". Case ignore matching object type.

### 0.2.7

Empty objects: Fix errors in generate empty table objects. Ask for new ids before ask for folder. Create unique name with new Id + old name

### 0.2.8

Empty objects: Create codeunit transfer without compilation errors. Total support for save tableextension fields

### 0.2.9

Empty objects: Problem fixed in transfer code

### 0.2.10

Command "JAM Open AL Renumber Tool" to open GUI to remove all previous commands in command bar

### 0.2.11

Errors in buttons execution