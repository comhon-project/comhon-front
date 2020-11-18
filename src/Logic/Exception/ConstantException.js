/*
 * This file is part of the Comhon package.
 *
 * (c) Jean-Philippe <jeanphilippe.perrotton@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @abstract
 */
class ConstantException {

	// model exception
	static get ALREADY_USED_MODEL_NAME_EXCEPTION() {return 100;}
	static get NOT_DEFINED_MODEL_EXCEPTION()       {return 101;}
	static get UNEXPECTED_MODEL_EXCEPTION()        {return 102;}
	static get UNDEFINED_PROPERTY_EXCEPTION()      {return 103;}
	static get CAST_EXCEPTION()                    {return 104;}
	static get PROPERTY_VISIBILITY_EXCEPTION()     {return 105;}
	static get NO_ID_PROPERTY_EXCEPTION()          {return 106;}
	static get REQUESTABLE_PROPERTY_EXCEPTION()    {return 107;}

	// object/value exception
	static get NOT_SATISFIED_RESTRICTION_EXCEPTION() {return 200;}
	static get ENUMERATION_EXCEPTION()               {return 201;}
	static get UNEXPECTED_VALUE_TYPE_EXCEPTION()     {return 202;}
	static get ABSTRACT_OBJECT_EXCEPTION()           {return 203;}
	static get MISSING_REQUIRED_VALUE_EXCEPTION()    {return 204;}
	static get MISSING_ID_FOREIGN_VALUE_EXCEPTION()  {return 205;}
	static get INVALID_COMPOSITE_ID_EXCEPTION()      {return 206;}
	static get CONFLICT_VALUES_EXCEPTION()           {return 207;}
	static get DEPENDS_VALUES_EXCEPTION()            {return 208;}

	// interfacing exception
	static get DUPLICATED_ID_EXCEPTION()          {return 300;}
	static get NOT_REFERENCED_VALUE_EXCEPTION()   {return 301;}
	static get CONTEXT_ID_EXCEPTION()             {return 302;}
	static get OBJECT_LOOP_EXCEPTION()            {return 303;}
	static get ABSTRACT_OBJECT_EXPORT_EXCEPTION() {return 304;}

	// restriction exception
	static get MALFORMED_INTERVAL_EXCEPTION()           {return 400;}
	static get NOT_SUPPORTED_MODEL_INTERVAL_EXCEPTION() {return 401;}
	static get NOT_EXISTING_REGEX_EXCEPTION()           {return 402;}

	// manifest exception
	static get MANIFEST_EXCEPTION()      {return 500;}
	static get RESERVED_WORD_EXCEPTION() {return 501;}

	// request exception
	static get MALFORMED_REQUEST_EXCEPTION()                  {return 700;}
	static get LITERAL_NOT_FOUND_EXCEPTION()                  {return 701;}
	static get INCOMPATIBLE_LITERAL_SERIALIZATION_EXCEPTION() {return 702;}
	static get LITERAL_PROPERTY_AGGREGATION_EXCEPTION()       {return 703;}
	static get MALFORMED_LITERAL_EXCEPTION()                  {return 704;}
	static get UNRESOLVABLE_LITERAL_EXCEPTION()               {return 705;}
	static get NOT_LINKABLE_LITERAL_EXCEPTION()               {return 706;}
	static get NOT_ALLOWED_REQUEST_EXCEPTION()                {return 707;}
	static get MULTIPLE_PROPERTY_LITERAL_EXCEPTION()          {return 708;}
	static get NOT_ALLOWED_LITERAL_EXCEPTION()                {return 709;}

	// serialization exception
	static get SERIALIZATION_EXCEPTION()          {return 800;}
	static get NOT_NULL_CONSTRAINT_EXCEPTION()    {return 801;}
	static get FOREIGN_CONSTRAINT_EXCEPTION()     {return 802;}
	static get UNIQUE_CONSTRAINT_EXCEPTION()      {return 803;}
	static get MANIFEST_SERIALIZATION_EXCEPTION() {return 804;}
	static get MISSING_NOT_NULL_EXCEPTION()       {return 805;}

}

export default ConstantException;
