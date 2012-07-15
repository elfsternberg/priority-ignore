require.config
    paths:
        'jquery': 'jquery-1.7.2'

require ['jquery', 'priority_tmpl', 'lawnchair'], ($, priority_template) ->

    class Prioritize

        constructor: (@repo) ->
            @repo.get 'priorities', (p) =>
                @priorities = if p? and p.priorities? then p.priorities else []
            @render()

            $('body').on 'click', @render
            $('#prioritize').on 'click', (ev) => @editPriority(ev, 'priority')
            $('#ignorize').on 'click', (ev) => @editPriority(ev, 'ignore')


        editPriority: (ev, ty = 'parent') =>


        newPriority: (ty, ev) =>
            ev.stopPropagation()
            return if $('.edit-priority').length > 0
            target = if ty == 'priority' then $('#priorities') else $('#ignorities')
            target.append(edit_priorities_template({fur: ty}))
            input = $('input.edit-priority-field', target)

            maybeNewPrioritySave = (ev) =>
                prioritySave = =>
                    @priorities.push({cat: ty, name: input.val()})
                    @save()

                code = if ev.keyCode then ev.keyCode else ev.which
                return prioritySave() if code == 13
                return @cleanAndRender() if code == 27

            input.on 'keyup', maybeNewPrioritySave
            $('.delete-priority-field', target).on 'click', @render
            input.focus()

        save: ->
            @repo.save {key: 'priorities', 'priorities': @priorities}, () =>
                @render()

        clean: ->
            @priorities = ({name: p.name, cat: p.cat} for p in @priorities when c.name.trim() != "")

        cleanAndRender: ->
            @clean()
            @render()

        save: ->
            @repo.save {key: 'priorities', 'priorities': @priorities}, =>
                @render()

        render: =>
            priority_enumerate = (cat) =>
                r = []
                for i in [0...@priorities.length]
                    if @priorities[i].cat == cat
                        r.push({name: @priorities[i].name, cat: @priorities[i].cat, pos: i})
                r

            $('#priorities').html(priority_template({priorities: priority_enumerate('priority')}))
            $('#ignorities').html(priority_template({priorities: priority_enumerate('ignore')}))

    $ ->
        prioritize = new Lawnchair {name: 'Prioritize'}, ->
            handler = new Prioritize(this)
            handler.render()
