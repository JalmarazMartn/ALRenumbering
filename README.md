# JAMRenumbering README

This extension implements the old renumbering utility from C/AL to AL.

## Features

This Renumber implementation has two commands: "Create initial CSV file" and "JAM Renumber Al Objects from CSV file"

Go to command palette and find "JAM Create Initial Renumbering CSV ready for fill new ids":

![alt text](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/CreateFile.gif?raw=true)

This command create a CSV template from workspace objects with NewID empty:

![alt text](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/EditExcel.gif?raw=true)

When you fill this column, you can go to next step: Renumber. The command will ask where you want to save CSV file.

Go to Command palette and find "JAM Renumber Al Objects from CSV file":

![alt text](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/Renum.gif?raw=true)

Command will ask the source CSV file with the renumbering and execute renumbering over all AL objects in current workspace. At the end of command changed objects will be open in the editor, and then you can review and save all or discard this renumbering:

![alt text](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/SaveAll.png?raw=true)

New command "JAM Update previous CSV Renumbering file with new objects in workspace", merge an existing CSV objects with set renumbering with new objects in workspace. The steps are: F1 "JAM Update previous CSV Renumbering file with new objects in workspace", select previous CSV file and then select target new merged file. They can be the same.

## Renumbering fields from tableextension

A new feature is added to the Renumbering command, to renumber fields from tableextension. This works alike previous renumbering options:

- First create a new CSV file with existing fields form existing tableextensions. The SCV file has a last column with the new ID of the field. You can create the CSV file with the command "JAM Create CSV table with extension fields to renumber".

- Whren the new ids are filled in the CSV file, we can can launch the fields renumbering with the command "JAM Apply field extension renumbering from CSV file". This commnadwill open a file dialog to select the CSV file with the tableextencion fields renumbering and then will execute the renumbering.

## New empty table objects generation command.

Sometimes in upgrading processes we need a copy of app tables and tableextensions, but logic, only fields and primary key, no procedures, triggers, and no other properties. You can generate these empty tables in a target directory, executing this command in the original app workspace: "JAM Generate empty logic table objects in target folder"

![alt text](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/EmptyObj.gif?raw=true)

You can get Empty table object for C/SIDE previous versions with "JAM Generate empty logic C/AL table objects in target single txt file" command. Instead a folder for a set of object files, you must select a single txt target file to save all objects. This could be useful for upgrade toolkits.

If you open the target workspace you could see the new empty tables only with the fields:

![alt text](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/EmptyObj.png?raw=true)

## Insert extension fields in an old C/SIDE txt table object

Needed for upgrade toolkits (IMO). New command "JAM Insert extension fields into old CSIDE table definition text file" to perform an insertion in a C/SIDE txt object the extension ot the fields of my current extension workspace. Steps:

1. With F1 execute "JAM Insert extension fields into old CSIDE table definition text file".
2. Select the old txt C/SIDE file with standart table definitios.
3. Select new txt C/SIDE file to save these standar tables with extension fields inserted.

## Requirements

Visual Studio Code and AL language.

## Extension Settings

No setup needed.

## Known Issues

Not yet.

## Release Notes

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