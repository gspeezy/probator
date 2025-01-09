
window.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e) => {

        const helpMatrix = /* NB: SourcePage values must be in lower case */
            [
                {
                    "Option": "Assisted Lodgment - Magistrates Court",
                    "SourcePage": "/magistratescourtonlineforms/default.aspx",
                    "HelpPage": "AssistedLodgment.html"
                },
                {
                    "Option": "Registration",
                    "SourcePage": "/registration",
                    "HelpPage": "RegisterNewAccount.html"
                },
                {
                    "Option": "Log In",
                    "SourcePage": "/account/login",
                    "HelpPage": "LogIn.html"
                },
                {
                    "Option": "eLodgement",
                    "SourcePage": "/elodgment/default.aspx",
                    "HelpPage": "eLodgment.html"
                },
                {
                    "Option": "Lodge Documents in Bulk",
                    "SourcePage": "/bulklodgment",
                    "HelpPage": "LodgeDocumentsinBulk.html"
                },
                {
                    "Option": "Upload Requested Items",
                    "SourcePage": "/lodgesubpoenaeditem",
                    "HelpPage": "UploadRequestedItems.html"
                },
                {
                    "Option": "Lodge/Manage Case",
                    "SourcePage": "/fer.portal",
                    "HelpPage": "LodgeManageCases.html"
                },
                {
                    "Option": "Lodge Prosecution Notices",
                    "SourcePage": "/prosecutionnotice/accused",
                    "HelpPage": "LodgeProsecutionNotices.html"
                },
                {
                    "Option": "Court Messaging",
                    "SourcePage": "/chat.portal",
                    "HelpPage": "CourtMessaging.html"
                },
                {
                    "Option": "Court Listings for [Today's Date]",
                    "SourcePage": "/courtlistings/todayscourtlistings",
                    "HelpPage": "CourtListingsforToday.html"
                },
                {
                    "Option": "Criminal Information",
                    "SourcePage": "/icmsportal/home",
                    "HelpPage": "CriminalInformation.html"
                },
                {
                    "Option": "Decisions",
                    "SourcePage": "/decisions",
                    "HelpPage": "Decisions.html"
                },
                {
                    "Option": "Notice of Residential Tenancies",
                    "SourcePage": "/residentialtenancy",
                    "HelpPage": "NoticeOfResidentialTenancies.html"
                },
                {
                    "Option": "Personal Injury Summaries",
                    "SourcePage": "/personalinjurysummaries",
                    "HelpPage": "PersonalInjurySummaries.html"
                },
				{
					"Option": "Search for Person/Matter Listings",
					"SourcePage": "/courtlistings/searchforcourtlistings",
					"HelpPage": "SearchforPersonMatterListings.html"
				},
				{
					"Option": "Search for a Probate Matter",
					"SourcePage": "/probate.portal/mattersearch",
					"HelpPage": "SearchforaProbateMatter.html"
				},
				{
					"Option": "Search All My Hearings",
					"SourcePage": "/myportal/searchmyhearings",
					"HelpPage": "SearchAllMyHearings.html"
				},
                {
                    "Option": "Suppression Orders",
                    "SourcePage": "/suppressionorders",
                    "HelpPage": "SuppressionOrders.html"
                },
                {
                    "Option": "Incoming Documents",
                    "SourcePage": "incomingdocuments",
                    "HelpPage": "ViewYourIncomingDocuments.html"
                 },
                {
                    "Option": "Manage Lodgments",
                    "SourcePage": "/managelodgment",
                    "HelpPage": "ViewYourLodgedDocuments1.html"
                },
                {
                    "Option": "Reset user Password",
                    "SourcePage": "/account/resetpassword",
                    "HelpPage": "IForgotMyPassword.html"
                },
                {
                    "Option": "Reset Password",
                    "SourcePage": "/account/forgotpassword",
                    "HelpPage": "IForgotMyPassword.html"
                },
                {
                    "Option": "Create User Password",
                    "SourcePage": "/account/resetuserpassword",
                    "HelpPage": "IForgotMyPassword.html"
                },
                {
                    "Option": "Change My Password",
                    "SourcePage": "/account/changepassword",
                    "HelpPage": "changepassword.html"
                },
                {
                    "Option": "Register User",
                    "SourcePage": "/account/registeruser",
                    "HelpPage": "RegisterNewAccount-ViaNominatede.html"
                },
                {
                    "Option": "Manage Users",
                    "SourcePage": "/account/manageusers",
                    "HelpPage": "RemoveaPersonsAccountFromYourOrg.html"
                },
                {
                    "Option": "Favourites",
                    "SourcePage": "/favourites",
                    "HelpPage": "FlagaCivilMatterasaFavourite.html"
                },
                {
                    "Option": "My Current Matters",
                    "SourcePage": "/currentmatters",
                    "HelpPage": "MyCurrentMatters.html"
                },
                {
                    "Option": "My Hearings",
                    "SourcePage": "/myportal/myhearings",
                    "HelpPage": "MyUpcomingHearings.html"
                },
                {
                    "Option": "Pay Fines",
                    "SourcePage": "/viewmycases",
                    "HelpPage": "SearchforandPayaFineInfringement.html"
                },
                {
                    "Option": "Pay Invoice",
                    "SourcePage": "/payinvoices",
                    "HelpPage": "PayInvoice.html"
                },
                {
                    "Option": "Manage Subscriptions",
                    "SourcePage": "/home/subscribe",
                    "HelpPage": "ManageSubscriptions.html"
                }
           ]

        if (e.target.tagName.toLowerCase() === 'a' && e.target.text.toLowerCase() === "help")
        {
            let targetIndex = 0;
            let helpDest = "";
            let currPage = window.location.pathname.toLowerCase();

            if (currPage.indexOf("onlineresolution") !== -1) {
                helpDest = e.target.href + "Context?ContextHelp=AssistedLodgment.html"
            } else {
                targetIndex = helpMatrix.findIndex(
                    elem => {
                        return currPage.indexOf(elem.SourcePage) !== -1;
                    }
                )
                if (targetIndex !== -1) {
                    helpDest = e.target.href + "Context?ContextHelp=" + helpMatrix[targetIndex].HelpPage;
                }
            }

            if (helpDest !== "") {
                window.open(helpDest, "_blank", "noopener noreferrer"); /* Leave the anchor's href alone */
                e.preventDefault(); /* Abort the anchor-click. We've already simulated it */
                return false;
            }

            return true;
        }
    })
});

