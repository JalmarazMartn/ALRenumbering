# JAMRenumbering README

This extension implements the old renumbering utility from C/AL to AL.

## New GUI for invoke all commands 2025

All the commands will be removed, and substituted bay a GUI with buttons. The GUI is called by command "JAM Open AL Renumber Tool":

![New GUI](https://github.com/JalmarazMartn/ALRenumbering/blob/master/images/NewGUI.gif?raw=true)

We can see 2 main secctions:

1. Object renumber. Sections to invoke 3 actions for create, open and apply renumering from CSV file. Select and option and push right button execute.
2. Fields renumbering. The same of above but refered to fields in tableextensions.

In the bottom we have 4 remaining commands (with a tooltip if you pass over the mouse):

1. Clear file: clear the reference to Cuurent file to open actions, to select another.
2. Generate empty Objects action.
3. Generate empty C/SIDE Objects action.
4. Insert fields C/SIDE.

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

Sometimes in upgrading processes we need a copy of app tables and tableextensions, but logic, only fields and primary key, no procedures, triggers, and no other properties. You can generate these empty tables in a target directory, executing this command in the original app workspace: "JAM Generate empty logic table objects in target folder". Will ask for  object starting new Id and target folder.

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
