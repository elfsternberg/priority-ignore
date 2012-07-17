require.config
    paths:
        'jquery': 'jquery-1.7.2'

require ['jquery',  'lawnchair'], ($) ->
    require ['priority_tmpl', 'edit_priority_tmpl', 'bootstrap-modal'], (priority_template, edit_priority_template) ->

        class Prioritize

            constructor: (@repo) ->
                @repo.get 'priorities', (p) =>
                    @priorities = if p? and p.priorities? then p.priorities else []
                    @render()
                    $('body').on 'click', @render
                    $('#prioritize').on 'click', @editPriority
                    $('#ignorize').on 'click', @editPriority


            editPriority: (ev) =>
                ev.stopPropagation()

                # Only allow one edit-priority at a time!
                return if $('.edit-priority').length > 0

                tg = $(ev.currentTarget)
                ty = tg.data('ty')
                pos = tg.data('pos')

                # If the position is 'N', we're adding a new list item to
                # the bottom of a list to be populated.

                if pos == 'N'
                    @priorities.push({name: '', cat: ty})
                    pos = @priorities.length - 1
                    (if ty == 'priority' then $('#priorities') else $('#ignorities'))
                        .append('<li class="priority" id="pos-' + pos + '"></li>')

                # Replace the list item's contents with the editor's
                # content.
                li = $('#pos-' + pos)
                li.html edit_priority_template
                    p:
                        name: @priorities[pos].name
                        pos: pos
                    type: ty

                input = $('input.edit-priority-field', li)

                maybePrioritySave = (ev) =>
                    prioritySave = =>
                        @priorities[pos] = {cat: ty, name: input.val()}
                        @save()

                    code = if ev.keyCode then ev.keyCode else ev.which
                    return prioritySave() if code == 13
                    return @cleanAndRender() if code == 27

                deletePriority = (ev) =>
                    ev.stopPropagation()
                    @priorities[pos].name = ""
                    @save()

                input.on 'keyup', maybePrioritySave
                $('.delete-priority-field', li).on 'click', deletePriority
                input.focus()

            easter: ->
                force_re = new RegExp('(Force|Empire|Vader|Darth|Sith|Jedi|rebel)')
                force = (1 for p in @priorities when force_re.test(p.name))
                if force.length > 0
                    console.log("Aroo?")
                    $('#prioritize').css('background-image', 'url(rebel.png)')
                    $('#ignorize').css('background-image', 'url(imperial.png)')
                else
                    $('#prioritize').css('background-image', 'url(thumbsup.png)')
                    $('#ignorize').css('background-image', 'url(thumbsdown.png)')

            clean: ->
                @priorities = ({name: p.name, cat: p.cat} for p in @priorities when p.name.trim() != "")

            save: ->
                @clean()
                @repo.save {key: 'priorities', 'priorities': @priorities}, =>
                    @render()

            render: =>
                @easter()
                priority_enumerate = (cat) =>
                    r = []
                    for i in [0...@priorities.length]
                        if @priorities[i].cat == cat
                            r.push({name: @priorities[i].name, cat: @priorities[i].cat, pos: i})
                    r

                $('#priorities').html(priority_template({priorities: priority_enumerate('priority'), type: 'priority'}))
                $('#ignorities').html(priority_template({priorities: priority_enumerate('ignore'), type: 'ignore'}))
                $('.priorityc').bind 'click', @editPriority

        $ ->
            prioritize = new Lawnchair {name: 'Prioritize'}, ->
                handler = new Prioritize(this)
                handler.render()

                $('#gearbutton').bind 'click', () => $('#message').modal()

                this.get 'priorities', (p) ->
                    if not p? or not p.priorities? or p.priorities.length == 0
                        $('#message').modal()
