define([], function() {
	return {
		constructor: "mayhem/ui/dijit/layout/ContentPane",
		kwArgs: {
			title: "Basic Form Widgets",
			selected: true
		},
		children: [
			{
				constructor: "mayhem/ui/dijit/form/Button",
				kwArgs: {
					label: "Simple",
					iconClass: "dijitIconTask"
				}
			},
			{
				constructor: "mayhem/ui/dijit/form/DropDownButton",
				kwArgs: {
					dropDown: {
						constructor: "mayhem/ui/dijit/DropDownMenu",
						kwArgs: {
							id: "dd-menu"
						},
						children: [
							{
								constructor: "mayhem/ui/dijit/MenuItem",
								kwArgs: {
									label: "Cut",
									onClick: "cut",
									iconClass: "dijitIconCut"
								}
							},
							{
								constructor: "mayhem/ui/dijit/MenuItem",
								kwArgs: {
									label: "Copy",
									onClick: "copy",
									iconClass: "dijitIconCopy"
								}
							},
							{
								constructor: "mayhem/ui/dijit/MenuItem",
								kwArgs: {
									label: "Paste",
									onClick: "paste",
									iconClass: "dijitIconPaste"
								}
							}
						]
					},
					iconClass: "dijitIconEdit"
				},
				content: "Drop Down"
			},
			{
				constructor: "mayhem/ui/dijit/form/ComboButton",
				kwArgs: {
					dropDown: {
						constructor: "mayhem/ui/dijit/DropDownMenu",
						kwArgs: {
							id: "combo-menu"
						},
						children: [
							{
								constructor: "mayhem/ui/dijit/MenuItem",
								kwArgs: {
									label: "Save",
									onClick: "save",
									iconClass: "dijitEditorIcon dijitEditorIconSave"
								}
							},
							{
								constructor: "mayhem/ui/dijit/MenuItem",
								kwArgs: {
									label: "Save As",
									onClick: "save-as"
								}
							}
						]
					},
					label: "Combo",
					iconClass: "dijitEditorIcon dijitEditorIconSave"
				},
				content: "Combo"
			},
			{
				constructor: "mayhem/ui/dijit/form/ToggleButton",
				kwArgs: {
					label: "Toggle",
					checked: true,
					iconClass: "dijitCheckBoxIcon"
				}
			},
			{
				constructor: "mayhem/ui/dijit/form/Button",
				kwArgs: {
					disabled: true,
					label: "Simple",
					iconClass: "dijitIconTask"
				}
			},
			{
				constructor: "mayhem/ui/dijit/form/DropDownButton",
				kwArgs: {
					disabled: true,
					dropDown: {
						constructor: "mayhem/ui/dijit/DropDownMenu",
						kwArgs: {
							id: "disabled-dd-menu"
						},
						children: [
							{
								constructor: "mayhem/ui/dijit/MenuItem",
								kwArgs: {
									label: "Cut",
									iconClass: "dijitEditorIcon dijitEditorIconCut",
									onClick: "cut"
								}
							},
							{
								constructor: "mayhem/ui/dijit/MenuItem",
								kwArgs: {
									label: "Copy",
									iconClass: "dijitEditorIcon dijitEditorIconCopy",
									onClick: "copy"
								}
							},
							{
								constructor: "mayhem/ui/dijit/MenuItem",
								kwArgs: {
									label: "Paste",
									iconClass: "dijitEditorIcon dijitEditorIconPaste",
									onClick: "paste"
								}
							}
						]
					},
					iconClass: "dijitIconEdit"
				},
				content: "<strong>Drop</strong> Down"
			},
			{
				constructor: "mayhem/ui/dijit/form/ComboButton",
				kwArgs: {
					disabled: true,
					dropDown: {
						constructor: "mayhem/ui/dijit/DropDownMenu",
						kwArgs: {
							id: "disabled-combo-menu"
						},
						children: [
							{
								constructor: "mayhem/ui/dijit/MenuItem",
								kwArgs: {
									label: "Save",
									onClick: "save",
									iconClass: "dijitEditorIcon dijitEditorIconSave"
								}
							},
							{
								constructor: "mayhem/ui/dijit/MenuItem",
								kwArgs: {
									label: "Save As",
									onClick: "save-as"
								}
							}
						]
					},
					label: "Combo",
					iconClass: "dijitEditorIcon dijitEditorIconSave"
				},
				content: "Combo"
			},
			{
				constructor: "mayhem/ui/dijit/form/ToggleButton",
				kwArgs: {
					disabled: true,
					label: "Toggle",
					checked: true,
					iconClass: "dijitCheckBoxIcon"
				}
			},
			{
				constructor: "mayhem/ui/dijit/form/CheckBox",
				kwArgs: {
					id: "check1"
				}
			},
			{
				constructor: "mayhem/ui/dijit/form/CheckBox",
				kwArgs: {
					id: "check2",
					checked: true
				}
			},
			{
				constructor: "mayhem/ui/dijit/form/CheckBox",
				kwArgs: {
					id: "check3",
					checked: "",
					disabled: true
				}
			},
			{
				constructor: "mayhem/ui/dijit/form/CheckBox",
				kwArgs: {
					id: "check4",
					checked: true,
					disabled: true
				}
			},
			{
				constructor: "mayhem/ui/dijit/form/RadioButton",
				kwArgs: {
					id: "g1rb1"
				}
			},
			{
				constructor: "mayhem/ui/dijit/form/RadioButton",
				kwArgs: {
					id: "g1rb2",
					checked: true
				}
			},
			{
				constructor: "mayhem/ui/dijit/form/RadioButton",
				kwArgs: {
					id: "g1rb3",
					disabled: true
				}
			}
		],
		content: [
			"<h2>Buttons</h2> <p>Buttons can do an action, display a menu, or both:</p> <div> Enabled: ",
			{ $child: 0 },
			" ",
			{ $child: 1 },
			" ",
			{ $child: 2 },
			" ",
			{ $child: 3 },
			"</div><div>Disabled: ",
			{ $child: 4 },
			" ",
			{ $child: 5 },
			" ",
			{ $child: 6 },
			" ",
			{ $child: 7 },
			"</div><hr class='spacer'></hr><h2>Check Boxes</h2><fieldset>",
			{ $child: 8 },
			" <label for='check1'>unchecked</label> ",
			{ $child: 9 },
			" <label for='check2'>checked</label> ",
			{ $child: 10 },
			" <label for='check3'>disabled</label> ",
			{ $child: 11 },
			" <label for='check4'>disabled and checked</label></fieldset><h2>Radio Buttons</h2><fieldset> ",
			{ $child: 12 },
			" <label for='g1rb1'>news</label> ",
			{ $child: 13 },
			" <label for='g1rb2'>talk</label> ",
			{ $child: 14 },
			" <label for='g1rb3'>weather (disabled)</label></fieldset>"
		]
	};
});
