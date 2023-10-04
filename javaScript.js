
//will store extracted values from the string in these two arrays
let mcodesArray = [];
let quantityArray = [];

//in case there are no deliveries for product, I need to have it's description
let descriptionArrayQuery = [];

//I need this variable to determne if there has been any values added to table.
//I use it to clear the empty row if a location/order name need to be added as the first table row to the table
let isTableEmpty = true;
//number of table columns
let tableColNumber = 6;
const generateTable =(expectedDatesArray, coverOrNotArray, expectedQuantitiesArray, resourceDescriptionArray) => {
	
	//pick up table body element into which we will insert tablerows with table data
	let shortageTable = document.getElementById("shortageTable");

	//check if the shortages must be deleted or combined 
	let combine = document.getElementById("combineTables").checked;
	if (combine === false || isTableEmpty === true) {
		shortageTable.innerHTML = "";
	}
	//declare td and tr variables, that will be used for td and tr element creation inside the for loop
	let tableRow;
	let tableData;
	
	//for each product one line with 6 table data elements are created and the inserted into tbody element.
	for (let i = 0; i < mcodesArray.length; i++) {
		//create new table row element
		tableRow = document.createElement("tr");
		
		//create table data elements, currently there are six of them
		//then insert value into the newly created element, add it to table row element, and insert table row into tbody element.
		
		//first table data element, PRODUCT CODE
		tableData = document.createElement("td");
		tableData.innerHTML = mcodesArray[i];
		tableRow.appendChild(tableData);
				
		//second table data element, PRODUCT DESCRIPTION
		tableData = document.createElement("td");
		
		//if product has no description from back end, check the description array descriptionArrayQuery
		if (resourceDescriptionArray[i] == "No description available") {
			
			//if there is trully no description, replace empy text with text with 'No description available'
			if (descriptionArrayQuery[i] == " "){descriptionArrayQuery[i] = "No description available";}
			
			tableData.innerHTML = descriptionArrayQuery[i];
			tableRow.appendChild(tableData);
			
		} else {
			tableData.innerHTML = resourceDescriptionArray[i];
			tableRow.appendChild(tableData);
		}
		
		//third table data element, SHORTAGE QUANTITY
		tableData = document.createElement("td");
		tableData.setAttribute("class", "redText");
		tableData.innerHTML = quantityArray[i];
		tableRow.appendChild(tableData);
		
		//fourth table data element, NEXT DELIVERY
		tableData = document.createElement("td");
		tableData.innerHTML = expectedDatesArray[i];
		tableRow.appendChild(tableData);
		
		//fith table data element, EXPECTED QUANTITY
		tableData = document.createElement("td");
		tableData.setAttribute("class", "greenText");
		tableData.innerHTML = expectedQuantitiesArray[i];
		tableRow.appendChild(tableData);
		
		//fith table data element, ENOUGH TO COVER
		tableData = document.createElement("td");
		
		//color yes green and no red
		if(coverOrNotArray[i] === "Yes") {
			tableData.setAttribute("class", "greenText");
		} else {
			tableData.setAttribute("class", "redText");
		}
		
		tableData.innerHTML = coverOrNotArray[i];
		tableRow.appendChild(tableData);
		//insert the table row into tbody
		shortageTable.appendChild(tableRow);
	
	}
	//as shortage table has been updated, must change this value;
	isTableEmpty = false;
		
}

//send data to server
let connected = true;
const notConnectedError = () =>{

	alert("Could not connect to server! Please check you have internet connection. Sorry about this :(")
	connected = false;
}
const sendValuesToServer =() => {
	//leave same variable name
	let str = 'productCodes='+mcodesArray+'&'+'productQuantities='+quantityArray+'&';
	let request;
	let lastUpdateSpan = document.getElementById("lastUpdate");
	if (XMLHttpRequest)
		{
			request = new XMLHttpRequest();
		}
			else if (ActiveXObject)
		{
			request = new ActiveXObject("Microsoft.XMLHTTP");
		}
	else {return false;}
	let url = "ajax/queryDatabase.php";
	request.open("POST", url, true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.onreadystatechange = function(){
		if(request.readyState ==4 && request.status ==200){
				let  response = JSON.parse(this.responseText);
				
				//deconstruct response object and send values to function that generates table
				let {expectedDatesArray, coverOrNotArray, expectedQuantitiesArray, resourceDescriptionArray, lastUpdate, moreThan3HoursAgo  } = response;
				generateTable(expectedDatesArray, coverOrNotArray, expectedQuantitiesArray, resourceDescriptionArray);
				
				//since I dont store the lastUpdate value in the fron end or in an input field
				//I'll just write code in a way that it will always update the lastUpdate time, even if it hadn't changed,
				//just makes my life easier.
				lastUpdateSpan.innerHTML = lastUpdate;
				if (moreThan3HoursAgo === true) {
					lastUpdateSpan.removeAttribute("class");
					lastUpdateSpan.setAttribute("class", "redText");
					lastUpdateSpan.title = "Deliveries have not been Updated for at least 3 Hours!";
				} else {
					lastUpdateSpan.removeAttribute("class");
					lastUpdateSpan.setAttribute("class", "greenText");
					lastUpdateSpan.title = "Deliveries have been updated in the last 3 hours.";
				}
				
		} else if(request.readyState==4 && request.status==0 ) {
			notConnectedError();
		} else {}
	}
	request.send(str);
	
}
//need a function to extract m code, quantity, and the total count of m codes
const extractValuesFromString = string => {

	//let reg = /\n/;

	const myArray = string.split(/\n/);
	for (let i = 0; i< myArray.length; i++) {
		
		//if (i == 0){mcodesArray.push(myArray[0]);}
		if (i%5 == 0) {mcodesArray.push(myArray[i]);}

		if ((i-3)%5 == 0) {
			//convert text to number.
			let quantityNumber = Number(myArray[i]);
			quantityArray.push(quantityNumber);
			
			}
			
		if ((i-1)%5 == 0) {
			//convert text to number.
			//let quantityNumber = Number(myArray[i]);
			descriptionArrayQuery.push(myArray[i]);
			
			}
	}
	sendValuesToServer();
}

const formValidation = string =>{
	let textForm = document.getElementById("textForm");
	
	//first check if a string is empty or not;
	if (string == "") {
		//if string is empty return error
		textForm.setAttribute("class", "errorBorder");
		alert("Nothing has been submitted!");
		return false;
	}
	
	//after checing string, the next thing to check is if the first letter of the string is m M p or P.
	let letterM = string.indexOf("M");
	let letterm = string.indexOf("m");
	let letterP = string.indexOf("P");
	let letterp = string.indexOf("p"); 
	//if it is anything else than these 4 letters return an error, otherwise remove error border.
	if (letterM === 0 || letterm === 0 || letterP === 0 || letterp === 0){
		textForm.removeAttribute("class");
		
		//sometimes when string gets passed from g1 order processor it contains two new lines at the end of it
		//if that is the case I want to remove them as it creates an empty table row with undefiend variables
		
        //will remove one new line as removing two doesn't seem to work.
		let last1 = string.slice(-1);
 
		if (last1 === '\n') {
			string= string.substring(0, string.length - 1);
			
		}else {
			//do nothing
		}

		//proceed with the string to another function
		extractValuesFromString(string);
	} else {
		//check if M or P code has been submitted at the very start of the string
		textForm.setAttribute("class", "errorBorder");
		alert("At the top left corner should be placed a product code which starts with either p or m letter.");
		return false;
	}
}


const getValue = () =>{
	//clear arrays
	mcodesArray = [];
	quantityArray = [];
	descriptionArrayQuery = [];
	
	let stringValue = document.getElementById("textForm").value;
	formValidation(stringValue);
}

//send values to back end.  
 const sendValuesToServer2 =str => {
	let request;
	if (XMLHttpRequest)
		{
			request = new XMLHttpRequest();
		}
			else if (ActiveXObject)
		{
			request = new ActiveXObject("Microsoft.XMLHTTP");
		}
	else {return false;}
	let responseDiv = document.getElementById("response");
	let lastUpdateSpan = document.getElementById("lastUpdate");
	let url = "ajax/updateDatabase.php";
	request.open("POST", url, true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.onreadystatechange = function(){
		if(request.readyState ==4 && request.status ==200){
				
				let  response = JSON.parse(this.responseText);
				
				let passwordForm = document.getElementById("password");
				if (response.errors.length > 0){
					alert(response.errors);
					
				} else {
					alert(response.deliveryQuantity+" deliveries has been successfully added.");
					//update time for last update
					lastUpdateSpan.innerHTML = response.lastUpdate;
					lastUpdateSpan.title = "Deliveries have been updated in the last 3 hours.";
                    //if the text was colored red, need to remove the red text class and add green one
                    //if this is not done, even ater update the text stays red, unless the page gets reloadd
                    lastUpdateSpan.removeAttribute("class");
					lastUpdateSpan.setAttribute("class", "greenText");
                    //it could be done with remove classList, but it's easier to ust paste code that I Know will work lol :)
                    
					setTimeout(function(){responseDiv.innerHTML=" ";},1500);
				}
				
		} else if(request.readyState==4 && request.status==0 ) {
			notConnectedError();
		} else {}
	}
	request.send(str);
	responseDiv.innerHTML = "Updating deliveries...";
	lastUpdateSpan.innerHTML = "...loading...";
}

let documentArray = [];
let dateArray = [];
let supplierArray = [];
let resourceArray = [];
let descriptionArray = [];
let quantityArray2 = [];
const fillArraysFromInput = () => {
	let inputValue = document.getElementById("xlx_json").value;
	
	//split the whole text into arrays, where each line is an array element
	const myArray = inputValue.split(/\n/);
	let newArray = [];
	//first make sure the arrays are empty;
		documentArray = [];
		dateArray = [];
		supplierArray = [];
		resourceArray = [];
		descriptionArray = [];
		quantityArray2 = [];
		
		//the first line of copied deliveries has to be checked. If it doesn't match the condition, means it wasn't copied properly.
		if (myArray[0] != "Expected Date	Document	Supplier/Customer	Resource	Resource Description	Expected Receipt Qty in Primary UM	Primary UM	Quantity Received in Primary UM	Status	Supplier/Customer Name	Contact	Unit Price Amount	Unit Price Currency	"){
			alert ("No deliveries have been updated! Please make sure you have copied deliveries from Protean properly!");
			return false
		}
	for (let i = 1; i< myArray.length; i++) {
		
		//now split each array into another array, where each column is an array element, but exclude the first line as it contains column descriptions
		
		newArray.push(myArray[i].split(/\t/));
		
		//first checkif there are any lines that are not open. It is an array within array and the 9th element is line value [8]
		if ((newArray[i-1][8]) == "Open"){
			//only if the line is open then fill the delivery details.
			//since in back end I use explode function and a comma as a seperator, I must make sure there are no comas left in any of the strings
			//hence will replace all comas with empty space;
			
			//first before arraypush I remove all commas and replace ' with '' to avoid breaking the query
			
			//fill date array:
			newArray[i-1][0] = newArray[i-1][0].replace(/,/g, "");
			newArray[i-1][0] = newArray[i-1][0].replace(/'/g, "''");
			dateArray.push(newArray[i-1][0]);
			
			//fill PO number array
			newArray[i-1][1] = newArray[i-1][1].replace(/,/g, "");
			newArray[i-1][1] = newArray[i-1][1].replace(/'/g, "''");
			documentArray.push(newArray[i-1][1]);
			
			//fill suplier number array
			newArray[i-1][2] = newArray[i-1][2].replace(/,/g, "");
			newArray[i-1][2] = newArray[i-1][2].replace(/'/g, "''");
			supplierArray.push(newArray[i-1][2]);
			
			//fill recourse m or p codes array
			newArray[i-1][3] = newArray[i-1][3].replace(/,/g, "");
			newArray[i-1][3] = newArray[i-1][3].replace(/'/g, "''");
			resourceArray.push(newArray[i-1][3]);
			
			//fill recourse description array
			newArray[i-1][4] = newArray[i-1][4].replace(/,/g, "");
			newArray[i-1][4] = newArray[i-1][4].replace(/'/g, "''");
			//remove & from strings as in php it stops the explode function.
			newArray[i-1][4] = newArray[i-1][4].replace(/&/g, "");
			descriptionArray.push(newArray[i-1][4]);
			
			//fill quantity array
			newArray[i-1][5] = newArray[i-1][5].replace(/,/g, "");
			newArray[i-1][5] = newArray[i-1][5].replace(/'/g, "''");
			quantityArray2.push(newArray[i-1][5]);
		}
	}

}


const validateUpdateInput =(sqlQueryValue, passwordValue)=> {
	
	//form validation
	let sqlQueryForm = document.getElementById("xlx_json");
	let passwordForm = document.getElementById("password");
	//first check if a string is empty or not;
	if (sqlQueryValue == "") {
		//if string is empty return error
		sqlQueryForm.setAttribute("class", "errorBorder");
		alert("Nothing has been submitted!");
		return false;
	} else {
		sqlQueryForm.removeAttribute("class");
	}
	
	fillArraysFromInput();
	
	let str = 'documentArray='+documentArray+'&';
	str+='dateArray='+dateArray+'&'+'supplierArray='+supplierArray+'&'+'quantityArray2='+quantityArray2+'&';
	str+='resourceArray='+resourceArray+'&'+'descriptionArray='+descriptionArray+'&';
	sendValuesToServer2(str);
}

const getUpdateInput =() => {
	
	let sqlQueryValue = document.getElementById("xlx_json").value;
	validateUpdateInput(sqlQueryValue);
	
}
const clearInputField = () =>{
	 let textForm = document.getElementById("textForm").value="";
 }
 
const clearTable = () =>{
	let shortageTable = document.getElementById("shortageTable");
	//first clear the table
	shortageTable.innerHTML = "";
	isTableEmpty = true;
	//then create an empty table row
	let tableRow = document.createElement("tr");
	 
	//then create empty td element with empty space
	let tableData1 = document.createElement("td");
	tableData1.innerHTML = "&nbsp;";
	tableRow.appendChild(tableData1);
	
	//create a td element without space and insert it 5 times into row
	let tableData = document.createElement("td");
	tableRow.appendChild(tableData);
	let tableData2 = document.createElement("td");
	tableRow.appendChild(tableData2);
	let tableData3 = document.createElement("td");
	tableRow.appendChild(tableData3);
	let tableData4 = document.createElement("td");
	tableRow.appendChild(tableData4);
	let tableData5 = document.createElement("td");
	tableRow.appendChild(tableData5);
	
	//then instert empty table row back into table.
	shortageTable.appendChild(tableRow);
	//as table has been clears, this value must be updated.
 }
 
const clearDeliveriesField = () =>{
	 let xlx_json = document.getElementById("xlx_json").value="";
 }
 
const copyTable = () => {

	// Get the table element
	let table = document.getElementById("reportTable");

	// Select the table contents
	let range = document.createRange();
	range.selectNodeContents(table);
	window.getSelection().removeAllRanges();
	window.getSelection().addRange(range);

	// Copy the table contents
	document.execCommand("copy");

	// Deselect the table contents
	window.getSelection().removeAllRanges();
  
}	

const fetchLastUpdate = () => {
	
	let request;
	if (XMLHttpRequest)	{
			request = new XMLHttpRequest();
		}	else if (ActiveXObject)	{
			request = new ActiveXObject("Microsoft.XMLHTTP");
		}	else {
			return false;
		}
	let url = "ajax/loadLastUpdate.php";
	let lastUpdateSpan = document.getElementById("lastUpdate");
	//let lastUpdate;
	request.open("POST", url, true);  
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.send();
	request.onreadystatechange = function(){
		if(request.readyState ==4 && request.status ==200){
			let  response = JSON.parse(this.responseText);
			document.getElementById("lastUpdate").innerHTML = response.lastUpdate;
			
			if (response.moreThan3HoursAgo === true ){
				lastUpdateSpan.removeAttribute("class");
				lastUpdateSpan.setAttribute("class", "redText");
				lastUpdateSpan.title = "Deliveries have not been Updated for at least 3 Hours!";
			} else {
				lastUpdateSpan.removeAttribute("class");
				lastUpdateSpan.setAttribute("class", "greenText");
				lastUpdateSpan.title = "Deliveries have been updated in the last 3 hours.";
			}
		} else if(request.readyState==4 && request.status==0 ) {
			notConnectedError();
		} else {}
	}
	
}

const addNameToShortageTable = () => {
	
	//first select value from the dropdown menu
	let nameValue = document.getElementById("orderName").value;
	
	//if custom name is selected, then use the name value from text input field.
	if (nameValue === "Customed") {
		nameValue = document.getElementById("customName").value;
		
		//if empty string report error
		let textInput = document.getElementById("customName");
		if (nameValue === "") {
			//add alert message
			alert("Please provide a name for order/location!");
			//add error border;
			textInput.setAttribute("class", "errorBorder");
		} else {
			//remove error border
			textInput.removeAttribute("class", "errorBorder");
		}
	}
	
	//to prevent inserting empty row, name will be added to table only if it has a value
	if (nameValue !== "") {
		let shortageTable = document.getElementById("shortageTable");
		//if the name is the first table row in the table, I must remove the empty tablew row first;
		let combine = document.getElementById("combineTables").checked;
		if (isTableEmpty === true || combine === false ){
			shortageTable.innerHTML = "";
		}
		
		//create an empty table row
		let tableRow = document.createElement("tr");
		 
		//then create empty td element with empty space
		let tableData1 = document.createElement("td");
		tableData1.setAttribute("colspan", "6");
		tableData1.innerHTML = nameValue;
		tableRow.appendChild(tableData1);
		
		//then instert empty table row back into table.
		shortageTable.appendChild(tableRow);
		isTableEmpty = false;
	}
}
const enableInput = () => {
	let value = document.getElementById("orderName").value;
	let textInput = document.getElementById("customName");
	if (value === "Customed") {
		//remove disabled attribute
		textInput.disabled = false;
	} else {
		//add disabled attribue
		textInput.disabled = true;
	}
}
 const init2 = ()=> {
	 
	let generateButton = document.getElementById("generateButton");
	generateButton.onclick = getValue;
	 
	let updateButton = document.getElementById("updateButton");
	updateButton.onclick = getUpdateInput;
	
	let copyTableButton = document.getElementById("copyTableButton");
	copyTableButton.onclick = copyTable;
	
	//clear buttons
	let clearInputButton = document.getElementById("clearInputButton");
	clearInputButton.onclick = clearInputField;
	
	let clearTableButton = document.getElementById("clearTableButton");
	clearTableButton.onclick = clearTable;
	
	let clearDeliveriesButton = document.getElementById("clearDeliveriesButton");
	clearDeliveriesButton.onclick = clearDeliveriesField;
	
	let addNameButton = document.getElementById("addNameButton");
	addNameButton.onclick = addNameToShortageTable;
	
	let orderName = document.getElementById("orderName");
	orderName.addEventListener("change", enableInput);

	
	//add function to signOut button
	document.getElementById("signOut").onclick = signOut;
	fetchLastUpdate();
	

}
const signOut = () => {
	//remove values from local storage
	localStorage.removeItem("username");
	localStorage.removeItem("password");
	//show login page
	showLoginPage();
	
	//add function to login button
	document.getElementById("loginButton").onclick = loginFunction;
	
	//clear fields and table on signout
	clearInputField();
	clearTable();
	clearDeliveriesField();
}

const fetchLoginDetailsLocalStorage = () => {
	let promiseObj = new Promise(function(resolve, reject){
		let request;
		
		//fetch username and password from local storage
		let usernameLocalStorage = localStorage.getItem("username");
		let passwordLocalStorage = localStorage.getItem("password");
		
		if (XMLHttpRequest)	{
				request = new XMLHttpRequest();
			}	else if (ActiveXObject)	{
				request = new ActiveXObject("Microsoft.XMLHTTP");
			}	else {
				return false;
			}
		let url = "ajax/checkSession.php";
		//let lastUpdateSpan = document.getElementById("lastUpdate");
		//let lastUpdate;
		request.open("POST", url, true);  
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		request.send("usernameLocalStorage="+usernameLocalStorage+'&'+"passwordLocalStorage="+passwordLocalStorage+'&') ;
		request.onreadystatechange = function(){
			if(request.readyState ==4 && request.status ==200){
				let  response = JSON.parse(this.responseText);
				resolve(response);
			} else if(request.readyState==4 && request.status==0 ) {
				reject(request.status );
				notConnectedError();
			} else {}
		}
	});
	return promiseObj;
	
}
//by default session is false
let sessionIsSet = false;


const showMainPage = () => {
	//add nodisplay to login element
	let grid0 = document.getElementById("grid0").classList.add("noDisplay");
	//show sign out button
	let signOut = document.getElementById("signOut").classList.remove("noDisplay");
	//remove nodisplay class from grid elements
	//had to move noDisplay class to the front of class property, otherwise it wasn't working
	let grid1 = document.getElementById("grid1");
	grid1.classList.remove("noDisplay");

	//there are 13 grid element. 0 is for login and 1-13 are for main page.
	//will add/remove clas noDisplay with a loop.
	for(let i=1; i<16;i++) {
		document.getElementById("grid"+i).classList.remove("noDisplay");
	
	}
	
	//load all the functions
	init2();
}
const showLoginPage = () => {
	//remove nodisplay class from login element
	let grid0 = document.getElementById("grid0").classList.remove("noDisplay");
	//hide sign out button
	let signOut = document.getElementById("signOut").classList.add("noDisplay");
	//add nodisplay to grid elements
	let gridElement;
	for(let i=1; i<16;i++) {
		gridElement = document.getElementById("grid"+i).classList.add("noDisplay");
	}
	
	//add function to sign out button
}

const loginFunction = () => {
	//animate button on click
	//fetch username, password, rememeber me from front end.
	let userNameValue = document.getElementById("username").value;
	let passwordValue = document.getElementById("password1").value;
	let rememberMeValue = document.getElementById("rememberMe").checked;
	
	let request;
	if (XMLHttpRequest)	{
			request = new XMLHttpRequest();
		}	else if (ActiveXObject)	{
			request = new ActiveXObject("Microsoft.XMLHTTP");
		}	else {
			return false;
		}
	let url = "ajax/login.php";
	//let lastUpdate;
	request.open("POST", url, true);  
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.send("userNameValue="+userNameValue+'&'+"passwordValue="+passwordValue+'&');
	request.onreadystatechange = function(){
		if(request.readyState ==4 && request.status ==200){
			let  response = JSON.parse(this.responseText);
				//in case this is not the first attempt to login with in proper details, remove red borders from input fields
				document.getElementById("password1").classList.remove("errorBorder");
				document.getElementById("username").classList.remove("errorBorder");
				if(response.errors.length === 0) {

				//if rememeber me is marked, add user name and password to local storage
				if (rememberMeValue === true) {
					localStorage.setItem("username", userNameValue);
					localStorage.setItem("password", passwordValue);	
				}
				//load main page
				showMainPage();

			} else {
				//mark field depending on the error.
				//since we only recieve one error at a time from back end there is no need to loop throug it, as an error will always be the first element in the array
				if (response.errors[0] === 'User name has not been submitted!' || response.errors[0] === 'User Name Not Found!') {
					document.getElementById("username").classList.add("errorBorder");
				}
				
				if (response.errors[0] === "Password has not been submitted!" || response.errors[0] === "Incorrect Password!") {
					document.getElementById("password1").classList.add("errorBorder");
				}				
				
				alert(response.errors);
			}

		} else if(request.readyState==4 && request.status==0 ) {
			notConnectedError();
		} else {}
	}	

}
const checkSessionIsSet = () => {
	//will need to use promise on this one because of ajax calls!!
	fetchLoginDetailsLocalStorage().then(function(response) {
		if(response.errors.length === 0) {

			//compare local storage login with values with values from back end to determine if session was set earlier
			if(response.sessionIsSet === true){
				sessionIsSet = true;
				showMainPage();
			} else {
				sessionIsSet = false;
				showLoginPage();
				document.getElementById("loginButton").onclick = loginFunction;
			}

		} else {
			alert(response.errors);
		}
	});	
	
}


document.addEventListener("DOMContentLoaded",checkSessionIsSet,false);
//onload = init2;