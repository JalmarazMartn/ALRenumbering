# JAMRenumbering README

This extension implements the old renumbering utility from C/AL to AL.

## Features

This Renumber implementation has two commands: "Create initial CSV file" and "JAM Renumber Al Objects from CSV file"

Go to command palette and find "JAM Create initial CSV file":

![alt text](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/CreateFile.gif?raw=true)

This command create a CSV template from workspace objects with NewID empty:

![alt text](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/EditExcel.gif?raw=true)

When you fill this column, you can go to next step: Renumber. The command will ask where you want to save CSV file.

Go to Command palette and find "JAM Renumber Al Objects from CSV file":

![alt text](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/Renum.gif?raw=true)

Command will ask the source CSV file with the renumbering and execute renumbering over all AL objects in current workspace. At the end of command changed objects will be open in the editor, and then you can review and save all or discard this renumbering:

![alt text](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/SaveAll.png?raw=true)

New command "JAM Update previous CSV Renumbering file with new objects in workspace", merge an existing CSV objects with set renumbering with new objects in workspace. The steps are: F1 "JAM Update previous CSV Renumbering file with new objects in workspace", select previous CSV file and then select target new merged file. They can be the same.

## New empty table objects generation command.

Sometimes in upgrading processes we need a copy of app tables and tableextensions, but logic, only fields and primary key, no procedures, triggers, and no other properties. You can generate these empty tables in a target directory, executing this command in the original app workspace: "JAM Generate empty logic table objects in target folder"

![alt text](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/EmptyObj.gif?raw=true)

If you open the target workspace you could see the new empty tables only with the fields:

![alt text](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/EmptyObj.png?raw=true)


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